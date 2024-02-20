import {
  AudienceSegment,
  audienceSegments,
  authors,
  Broadcast,
  broadcasts,
  broadcastsSegments,
  outgoingMessages,
} from '../../drizzle/schema.ts'
import { db } from '../utils.ts'

const createOutgoingMessages = async () => {
  const broadcast = await createBroadcast()
  const segment = await createSegment(broadcast.id!)
  const newAuthors = [
    { phoneNumber: '+11234567891' },
    { phoneNumber: '+11234567890' },
  ]
  await db.insert(authors).values(newAuthors).onConflictDoNothing()
  const newOutgoingMessages = [
    {
      recipientPhoneNumber: '+11234567891',
      broadcastId: broadcast.id,
      segmentId: segment.id,
      message: 'first m',
      isSecond: false,
    },
    {
      recipientPhoneNumber: '+11234567891',
      broadcastId: broadcast.id,
      segmentId: segment.id,
      message: 'second m',
      isSecond: true,
    },
  ]
  await db.insert(outgoingMessages).values(newOutgoingMessages)
}

const createBroadcast = async (noUsers = 10, runAt?: Date): Promise<Broadcast> => {
  const broadcast = {
    runAt: runAt || new Date(),
    delay: '00:10:00',
    noUsers,
    firstMessage: 'first m',
    secondMessage: 'second m',
    editable: !runAt,
  }
  const results = await db.insert(broadcasts).values(broadcast).returning()
  return results[0]
}

const createSegment = async (broadcastId: number, order = 'ASC'): Promise<AudienceSegment> => {
  const newSegment = {
    query: `SELECT from_field as phone_number
            FROM twilio_messages
            ORDER BY id ${order}`,
    description: 'faker.lorem.sentence()',
  }
  const segment = await db.insert(audienceSegments).values(newSegment).onConflictDoNothing().returning()
  const newBroadcastSegments = []
  newBroadcastSegments.push({
    broadcastId,
    segmentId: segment[0].id,
    ratio: 20,
  })
  await db.insert(broadcastsSegments).values(newBroadcastSegments).onConflictDoNothing()
  return segment[0]
}

export { createOutgoingMessages }
