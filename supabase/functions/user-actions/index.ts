import * as log from 'log'

import { RequestBody, RuleType } from './types.ts'
import { handleError, insertHistory } from './handlers/utils.ts'
import { handleNewComment } from './handlers/comment-handler.ts'
import { handleTeamChange } from './handlers/team-handler.ts'
import { handleLabelChange } from './handlers/label-handler.ts'
import { handleConversationAssigneeChange, handleConversationStatusChanged } from './handlers/conversation-handler.ts'
import { handleResubscribe, handleTwilioMessage } from './handlers/twilio-message-handler.ts'
import { verify } from './authentication.ts'
import supabase from './database.ts'
import { authenticationFailed } from './authentication.ts'
import { handleBroadcastOutgoing, handleBroadcastReply } from './handlers/broadcast-handlers.ts'
import { refreshLookupCache } from './services/lookup.ts'

const handler = async (req: Request) => {
  let requestBody: RequestBody
  try {
    requestBody = await req.json()
  } catch (err) {
    log.error(`Bad Request: Invalid JSON: ${err}`)
    await authenticationFailed(req, 'Missing request body')
    return new Response('', { status: 202 })
  }

  const requestHeaderSig = req.headers.get('X-Hook-Signature')
  if (!requestHeaderSig) {
    log.error('Bad Request: X-Hook-Signature header is missing')
    await authenticationFailed(
      req,
      'Missing authentication header',
      requestBody,
    )
    return new Response('', { status: 202 })
  } else {
    const verified = await verify(requestHeaderSig, requestBody)
    if (!verified) {
      await authenticationFailed(
        req,
        'Missing authentication header',
        requestBody,
      )
      return new Response('', { status: 202 })
    }
  }
  log.info(`Start handling rule: ${requestBody.rule.id}, ${requestBody.rule.type}`)
  try {
    await insertHistory(supabase, requestBody)
    switch (requestBody.rule.type) {
      case RuleType.NewComment:
        await handleNewComment(supabase, requestBody)
        if (requestBody.latest_message?.references && requestBody.latest_message.references.length > 0) {
          // Only new comments in SMS conversations
          await refreshLookupCache(requestBody.conversation.id, requestBody.latest_message.references)
        }
        break
      case RuleType.TeamChanged:
        await handleTeamChange(supabase, requestBody)
        break
      case RuleType.LabelChanged:
        await handleLabelChange(supabase, requestBody)
        break
      case RuleType.ConversationClosed:
      case RuleType.ConversationReopened:
        await handleConversationStatusChanged(
          supabase,
          requestBody,
          requestBody.rule.type,
        )
        break
      case RuleType.ConversationAssigneeChange:
        await handleConversationAssigneeChange(supabase, requestBody)
        break
      case RuleType.IncomingTwilioMessage:
        await handleTwilioMessage(supabase, requestBody)
        await handleBroadcastReply(supabase, requestBody)
        await handleResubscribe(supabase, requestBody)
        await refreshLookupCache(requestBody.conversation.id, requestBody.message!.references)
        break
      case RuleType.OutgoingTwilioMessage:
        await handleTwilioMessage(supabase, requestBody)
        await refreshLookupCache(requestBody.conversation.id, requestBody.message!.references)
        await handleBroadcastOutgoing(supabase, requestBody)
        break
      default:
        throw new Error(`Unhandled rule type: ${requestBody.rule.type}`)
    }

    log.info(`Successfully handled rule: ${requestBody.rule.id}, ${requestBody.rule.type}`)
    return new Response('Ok', { status: 200 })
  } catch (err) {
    log.error(
      `An error occurred: ${err.message}.
      Request body: ${JSON.stringify(requestBody)}
      Stack trace: ${err.stack}`,
    )
    await handleError(supabase, requestBody, err)
    // Return 200 to avoid retrying the request
    return new Response('', { status: 200 })
  }
}

Deno.serve(handler)

export { handler }
