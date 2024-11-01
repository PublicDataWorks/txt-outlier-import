import * as log from 'log'
import { eq } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

import { lookupTemplate } from '../drizzle/schema.ts'

const CREATE_MESSAGE_URL = 'https://public.missiveapp.com/v1/messages/'
const CREATE_POST_URL = 'https://public.missiveapp.com/v1/posts'
const MISSIVE_ORGANIZATION_ID = Deno.env.get('MISSIVE_ORGANIZATION_ID')
if (!MISSIVE_ORGANIZATION_ID) {
  throw new Error('MISSIVE_ORGANIZATION_ID environment variable is not set')
}

const getSecretKey = async (db: PostgresJsDatabase) => {
  const secretKeyLookup = await db
    .select()
    .from(lookupTemplate)
    .where(eq(lookupTemplate.name, 'missive_secret_for_webhook_service'))
    .limit(1)

  if (secretKeyLookup.length === 0) {
    log.error('Missive secret key not found in lookup table')
    return
  }
  return secretKeyLookup[0].content
}

const getMissiveMessage = async (db: PostgresJsDatabase, id: string) => {
  const secretKey = await getSecretKey(db)
  if (!secretKey) {
    return
  }
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${secretKey}`,
  }
  const url = `${CREATE_MESSAGE_URL}${id}`
  const response = await fetch(url, { method: 'GET', headers: headers })
  if (!response.ok) {
    const errorMessage = `Failed to get Missive message. Message id: ${id}}, Missive's respond = ${
      JSON.stringify(await response.json())
    }`
    log.error(errorMessage)
  }

  return response.json()
}

const createPost = async (db: PostgresJsDatabase, conversationId: string, postBody: string, sharedLabelId?: string) => {
  const secretKey = await getSecretKey(db)
  if (!secretKey) {
    return
  }
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${secretKey}`,
  }
  // deno-lint-ignore no-explicit-any
  const postData: any = {
    posts: {
      'username': 'TXT Outlier',
      notification: {
        title: 'System',
        body: `Admins action`,
      },
      text: postBody,
      conversation: conversationId,
    },
  }

  if (sharedLabelId) {
    postData.posts.add_shared_labels = [sharedLabelId]
    postData.posts.close = true
    postData.posts.organization = MISSIVE_ORGANIZATION_ID
  }

  const response = await fetch(CREATE_POST_URL, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(postData),
  })

  if (!response.ok) {
    log.error(`HTTP error! detail: ${JSON.stringify(await response.json())}`)
  }

  return response.json()
}

export { createPost, getMissiveMessage }
