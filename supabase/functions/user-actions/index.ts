import { RequestBody, RuleType } from './types.ts'
import { handleError, insertHistory } from './handlers/utils.ts'
import { handleNewComment } from './handlers/comment-handler.ts'
import { handleTeamChange } from './handlers/team-handler.ts'
import { handleLabelChange } from './handlers/label-handler.ts'
import { handleConversationAssigneeChange, handleConversationStatusChanged } from './handlers/conversation-handler.ts'
import { handleTwilioMessage } from './handlers/twilio-message-handler.ts'
import { verify } from './authentication.ts'
import supabase from './database.ts'
import { authenticationFailed } from './authentication.ts'
import { deletePendingSecondBroadcastMessage } from './handlers/broadcast-reply-handlers.ts'

Deno.serve(async (req) => {
  let requestBody: RequestBody
  try {
    requestBody = await req.json()
    console.log(requestBody)
  } catch (err) {
    console.error(`Bad Request: Invalid JSON: ${err}`)
    await authenticationFailed(req, 'Missing request body')
    return new Response('', { status: 202 })
  }

  const requestHeaderSig = req.headers.get('X-Hook-Signature')
  if (!requestHeaderSig) {
    console.error('Bad Request: X-Hook-Signature header is missing')
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

  await insertHistory(supabase, requestBody)
  try {
    switch (requestBody.rule.type) {
      case RuleType.NewComment:
        await handleNewComment(supabase, requestBody)
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
        await deletePendingSecondBroadcastMessage(supabase, requestBody)
        break
      case RuleType.OutgoingTwilioMessage:
        await handleTwilioMessage(supabase, requestBody)
        break
      default:
        throw new Error(`Unhandled rule type: ${requestBody.rule.type}`)
    }

    console.log(`Successfully handled rule: ${requestBody.rule.id}`)
    return new Response('Ok', { status: 200 })
  } catch (err) {
    console.error(
      `An error occurred: ${err.message}.
    Request body: ${JSON.stringify(requestBody)}
    Stack trace: ${err.stack}`,
    )
    await handleError(supabase, requestBody, err)
    return new Response('', { status: 400 })
  }
})
