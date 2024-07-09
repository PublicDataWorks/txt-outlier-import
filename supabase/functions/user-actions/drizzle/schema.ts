import {
  bigint,
  bigserial,
  boolean,
  index,
  integer,
  interval,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'npm:drizzle-orm/pg-core'

export const aalLevel = pgEnum('aal_level', ['aal1', 'aal2', 'aal3'])
export const codeChallengeMethod = pgEnum('code_challenge_method', ['s256', 'plain'])
export const factorStatus = pgEnum('factor_status', ['unverified', 'verified'])
export const factorType = pgEnum('factor_type', ['totp', 'webauthn'])
export const twilioStatus = pgEnum('twilio_status', ['delivered', 'undelivered', 'failed', 'sent', 'received'])
export const keyStatus = pgEnum('key_status', ['default', 'valid', 'invalid', 'expired'])
export const keyType = pgEnum('key_type', [
  'aead-ietf',
  'aead-det',
  'hmacsha512',
  'hmacsha256',
  'auth',
  'shorthash',
  'generichash',
  'kdf',
  'secretbox',
  'secretstream',
  'stream_xchacha20',
])
export const equalityOp = pgEnum('equality_op', ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in'])
export const action = pgEnum('action', ['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'ERROR'])
export const requestStatus = pgEnum('request_status', ['PENDING', 'SUCCESS', 'ERROR'])
export const oneTimeTokenType = pgEnum('one_time_token_type', [
  'confirmation_token',
  'reauthentication_token',
  'recovery_token',
  'email_change_token_new',
  'email_change_token_current',
  'phone_change_token',
])

export const broadcastsSegments = pgTable('broadcasts_segments', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigserial('id', { mode: 'number' }).primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  broadcastId: bigint('broadcast_id', { mode: 'number' }).notNull().references(() => broadcasts.id, {
    onDelete: 'cascade',
  }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  segmentId: bigint('segment_id', { mode: 'number' }).notNull().references(() => audienceSegments.id, {
    onUpdate: 'cascade',
  }),
  ratio: smallint('ratio').notNull(),
  firstMessage: text('first_message'),
  secondMessage: text('second_message'),
}, (table) => {
  return {
    broadcastIdSegmentIdIdx: index('broadcasts_segments_broadcast_id_segment_id_idx').on(
      table.broadcastId,
      table.segmentId,
    ),
    broadcastIdSegmentIdUnique: unique('broadcast_id_segment_id_unique').on(table.broadcastId, table.segmentId),
  }
})

export const lookupTemplate = pgTable('lookup_template', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigserial('id', { mode: 'number' }).primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  name: varchar('name'),
  content: text('content'),
  type: varchar('type'),
})

export const broadcastSentMessageStatus = pgTable('broadcast_sent_message_status', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigserial('id', { mode: 'number' }).primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  recipientPhoneNumber: text('recipient_phone_number').notNull().references(() => authors.phoneNumber, {
    onUpdate: 'cascade',
  }),
  missiveId: uuid('missive_id').notNull(),
  missiveConversationId: uuid('missive_conversation_id').notNull(),
  twilioSentAt: timestamp('twilio_sent_at', { withTimezone: true, mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  broadcastId: bigint('broadcast_id', { mode: 'number' }).notNull().references(() => broadcasts.id, {
    onDelete: 'cascade',
  }),
  isSecond: boolean('is_second').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  twilioSentStatus: twilioStatus('twilio_sent_status').default('delivered').notNull(),
  twilioId: text('twilio_id'),
  message: text('message').notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  audienceSegmentId: bigint('audience_segment_id', { mode: 'number' }).references(() => audienceSegments.id),
}, (table) => {
  return {
    recipientPhoneNumberIdx: index('broadcast_sent_message_status_recipient_phone_number_idx').on(
      table.recipientPhoneNumber,
    ),
    createdAtIdx: index('broadcast_sent_message_status_created_at_idx').on(table.createdAt),
    broadcastSentMessageStatusMissiveIdKey: unique('broadcast_sent_message_status_missive_id_key').on(table.missiveId),
  }
})

export const twilioMessages = pgTable('twilio_messages', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  preview: text('preview').notNull(),
  type: text('type'),
  deliveredAt: timestamp('delivered_at', { withTimezone: true, mode: 'string' }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  references: text('references').array().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  externalId: text('external_id'),
  attachments: text('attachments'),
  fromField: text('from_field').notNull().references(() => authors.phoneNumber),
  toField: text('to_field').notNull().references(() => authors.phoneNumber),
  isBroadcastReply: boolean('is_broadcast_reply').default(false).notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  replyToBroadcast: bigint('reply_to_broadcast', { mode: 'number' }).references(() => broadcasts.id),
  senderId: uuid('sender_id').references(() => users.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    duplicateDeliveredAtIdx: index('twilio_messages_duplicate_delivered_at_idx').on(table.deliveredAt),
    duplicateIsBroadcastReplyIdx: index('twilio_messages_duplicate_is_broadcast_reply_idx').on(table.isBroadcastReply),
    duplicateFromFieldIdx: index('twilio_messages_duplicate_from_field_idx').on(table.fromField),
  }
})

export const unsubscribedMessages = pgTable('unsubscribed_messages', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigserial('id', { mode: 'number' }).primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  broadcastId: bigint('broadcast_id', { mode: 'number' }).references(() => broadcasts.id, { onDelete: 'cascade' }),
  twilioMessageId: uuid('twilio_message_id').notNull().references(() => twilioMessages.id),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  replyTo: bigint('reply_to', { mode: 'number' }).references(() => broadcastSentMessageStatus.id, {
    onDelete: 'cascade',
  }),
}, (table) => {
  return {
    twilioMessageIdIdx: index('unsubscribed_messages_twilio_message_id_idx').on(table.twilioMessageId),
    broadcastIdIdx: index('unsubscribed_messages_broadcast_id_idx').on(table.broadcastId),
  }
})

export const comments = pgTable('comments', {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  body: text('body'),
  taskCompletedAt: timestamp('task_completed_at', { withTimezone: true, mode: 'string' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  isTask: boolean('is_task').default(false).notNull(),
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }),
  attachment: jsonb('attachment'),
})

export const commentsMentions = pgTable('comments_mentions', {
  id: serial('id').primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  commentId: uuid('comment_id').notNull().references(() => comments.id),
  userId: uuid('user_id').references(() => users.id),
  teamId: uuid('team_id').references(() => teams.id),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
})

export const conversationHistory = pgTable('conversation_history', {
  id: serial('id').primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  changeType: text('change_type'),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
})

export const conversationsLabels = pgTable('conversations_labels', {
  id: serial('id').primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onUpdate: 'cascade' }),
  labelId: uuid('label_id').notNull().references(() => labels.id, { onUpdate: 'cascade' }),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  isArchived: boolean('is_archived').default(false).notNull(),
})

export const invokeHistory = pgTable('invoke_history', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigserial('id', { mode: 'number' }).primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  conversationId: uuid('conversation_id'),
  requestBody: jsonb('request_body'),
}, (table) => {
  return {
    requestBodyIdx: index('invoke_history_request_body_idx').on(table.requestBody),
  }
})

export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  messagesCount: integer('messages_count').default(0).notNull(),
  draftsCount: integer('drafts_count').default(0).notNull(),
  sendLaterMessagesCount: integer('send_later_messages_count').default(0).notNull(),
  attachmentsCount: integer('attachments_count').default(0).notNull(),
  tasksCount: integer('tasks_count').default(0).notNull(),
  completedTasksCount: integer('completed_tasks_count').default(0).notNull(),
  subject: text('subject'),
  latestMessageSubject: text('latest_message_subject'),
  assigneeNames: text('assignee_names'),
  assigneeEmails: text('assignee_emails'),
  sharedLabelNames: text('shared_label_names'),
  webUrl: text('web_url').notNull(),
  appUrl: text('app_url').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  closed: boolean('closed'),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
})

export const conversationsAssignees = pgTable('conversations_assignees', {
  id: serial('id').primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  unassigned: boolean('unassigned').default(false).notNull(),
  closed: boolean('closed').default(false).notNull(),
  archived: boolean('archived').default(false).notNull(),
  trashed: boolean('trashed').default(false).notNull(),
  junked: boolean('junked').default(false).notNull(),
  assigned: boolean('assigned').default(false).notNull(),
  flagged: boolean('flagged').default(false).notNull(),
  snoozed: boolean('snoozed').default(false).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
})

export const conversationsAssigneesHistory = pgTable('conversations_assignees_history', {
  id: serial('id').primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  unassigned: boolean('unassigned').default(false).notNull(),
  closed: boolean('closed').default(false).notNull(),
  archived: boolean('archived').default(false).notNull(),
  trashed: boolean('trashed').default(false).notNull(),
  junked: boolean('junked').default(false).notNull(),
  assigned: boolean('assigned').default(false).notNull(),
  flagged: boolean('flagged').default(false).notNull(),
  snoozed: boolean('snoozed').default(false).notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  conversationHistoryId: bigint('conversation_history_id', { mode: 'number' }).references(
    () => conversationHistory.id,
    { onDelete: 'cascade' },
  ),
})

export const conversationsAuthors = pgTable('conversations_authors', {
  id: serial('id').primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  conversationId: uuid('conversation_id').notNull(),
  authorPhoneNumber: text('author_phone_number').notNull().references(() => authors.phoneNumber),
})

export const conversationsUsers = pgTable('conversations_users', {
  id: serial('id').primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  unassigned: boolean('unassigned').default(false).notNull(),
  closed: boolean('closed').default(false).notNull(),
  archived: boolean('archived').default(false).notNull(),
  trashed: boolean('trashed').default(false).notNull(),
  junked: boolean('junked').default(false).notNull(),
  assigned: boolean('assigned').default(false).notNull(),
  flagged: boolean('flagged').default(false).notNull(),
  snoozed: boolean('snoozed').default(false).notNull(),
}, (table) => {
  return {
    conversationsUsersUniqueKey: unique('conversations_users_unique_key').on(table.conversationId, table.userId),
  }
})

export const errors = pgTable('errors', {
  id: serial('id').primaryKey().notNull(),
  requestBody: text('request_body').notNull(),
  ruleType: text('rule_type'),
  ruleId: uuid('rule_id'),
  ruleDescription: text('rule_description'),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
})

export const labels = pgTable('labels', {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  name: text('name').default('').notNull(),
  nameWithParentNames: text('name_with_parent_names').default('').notNull(),
  color: text('color'),
  parent: uuid('parent'),
  shareWithOrganization: boolean('share_with_organization').default(false),
  visibility: text('visibility'),
})

export const rules = pgTable('rules', {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  description: text('description').notNull(),
  type: text('type').notNull(),
  id: uuid('id').defaultRandom().primaryKey().notNull(),
})

export const tasksAssignees = pgTable('tasks_assignees', {
  id: serial('id').primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  commentId: uuid('comment_id').notNull().references(() => comments.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
})

export const teams = pgTable('teams', {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  name: text('name'),
  id: uuid('id').primaryKey().notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
})

export const userHistory = pgTable('user_history', {
  id: serial('id').primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  name: text('name'),
  email: text('email'),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    idxUserHistoryId: index('idx_user_history_id').on(table.id),
  }
})

export const users = pgTable('users', {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  email: text('email'),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  id: uuid('id').primaryKey().notNull(),
})

export const audienceSegments = pgTable('audience_segments', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigserial('id', { mode: 'number' }).primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  query: text('query').notNull(),
  description: text('description').notNull(),
  name: text('name'),
})

export const broadcasts = pgTable('broadcasts', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigserial('id', { mode: 'number' }).primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  runAt: timestamp('run_at', { withTimezone: true, mode: 'string' }).notNull(),
  delay: interval('delay').default('00:10:00').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  editable: boolean('editable').default(true).notNull(),
  noUsers: integer('no_users').default(0).notNull(),
  firstMessage: text('first_message').notNull(),
  secondMessage: text('second_message').notNull(),
  twilioPaging: text('twilio_paging'),
})

export const organizations = pgTable('organizations', {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  name: text('name').notNull(),
  id: uuid('id').defaultRandom().primaryKey().notNull(),
})

export const outgoingMessages = pgTable('outgoing_messages', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigserial('id', { mode: 'number' }).primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  recipientPhoneNumber: text('recipient_phone_number').notNull().references(() => authors.phoneNumber),
  message: text('message').notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  broadcastId: bigint('broadcast_id', { mode: 'number' }).notNull().references(() => broadcasts.id, {
    onDelete: 'cascade',
  }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  segmentId: bigint('segment_id', { mode: 'number' }).notNull().references(() => audienceSegments.id, {
    onUpdate: 'cascade',
  }),
  isSecond: boolean('is_second').default(false).notNull(),
  processed: boolean('processed').default(false).notNull(),
}, (table) => {
  return {
    uniquePhoneNumberBroadcastIdIsSecond: unique('unique_phone_number_broadcast_id_is_second').on(
      table.recipientPhoneNumber,
      table.broadcastId,
      table.isSecond,
    ),
  }
})

export const lookupHistory = pgTable('lookup_history', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigserial('id', { mode: 'number' }).primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  address: text('address').default(''),
  taxStatus: varchar('tax_status').default(''),
  rentalStatus: varchar('rental_status').default(''),
  zipCode: varchar('zip_code').default(''),
})

export const weeklyReports = pgTable('weekly_reports', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigserial('id', { mode: 'number' }).primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  conversationStartersSent: integer('conversation_starters_sent').default(0),
  broadcastReplies: integer('broadcast_replies').default(0),
  textIns: integer('text_ins').default(0),
  reporterConversations: integer('reporter_conversations').default(0),
  unsubscribes: integer('unsubscribes').default(0),
  userSatisfaction: integer('user_satisfaction').default(0),
  problemAddressed: integer('problem_addressed').default(0),
  crisisAverted: integer('crisis_averted').default(0),
  accountabilityGap: integer('accountability_gap').default(0),
  source: integer('source').default(0),
  unsatisfied: integer('unsatisfied').default(0),
  futureKeyword: integer('future_keyword').default(0),
  statusRegistered: integer('status_registered').default(0),
  statusUnregistered: integer('status_unregistered').default(0),
  statusTaxDebt: integer('status_tax_debt').default(0),
  statusNoTaxDebt: integer('status_no_tax_debt').default(0),
  statusCompliant: integer('status_compliant').default(0),
  statusForeclosed: integer('status_foreclosed').default(0),
  repliesTotal: integer('replies_total').default(0),
  repliesProactive: integer('replies_proactive').default(0),
  repliesReceptive: integer('replies_receptive').default(0),
  repliesConnected: integer('replies_connected').default(0),
  repliesPassive: integer('replies_passive').default(0),
  repliesInactive: integer('replies_inactive').default(0),
  unsubscribesTotal: integer('unsubscribes_total').default(0),
  unsubscribesProactive: integer('unsubscribes_proactive').default(0),
  unsubscribesReceptive: integer('unsubscribes_receptive').default(0),
  unsubscribesConnected: integer('unsubscribes_connected').default(0),
  unsubscribesPassive: integer('unsubscribes_passive').default(0),
  unsubscribesInactive: integer('unsubscribes_inactive').default(0),
  failedDeliveries: integer('failed_deliveries').default(0),
})

export const spatialRefSys = pgTable('spatial_ref_sys', {
  srid: integer('srid').notNull(),
  authName: varchar('auth_name', { length: 256 }),
  authSrid: integer('auth_srid'),
  srtext: varchar('srtext', { length: 2048 }),
  proj4Text: varchar('proj4text', { length: 2048 }),
})

export const authors = pgTable('authors', {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  name: text('name'),
  phoneNumber: text('phone_number').primaryKey().notNull(),
  unsubscribed: boolean('unsubscribed').default(false).notNull(),
  zipcode: varchar('zipcode'),
  email: text('email'),
})

export type Rule = typeof rules.$inferInsert
export type User = typeof users.$inferInsert
export type UserHistory = typeof userHistory.$inferInsert
export type Err = typeof errors.$inferInsert
export type Comment = typeof comments.$inferInsert
export type CommentMention = typeof commentsMentions.$inferInsert
export type Team = typeof teams.$inferInsert
export type Conversation = typeof conversations.$inferInsert
export type Label = typeof labels.$inferInsert
export type ConversationLabel = typeof conversationsLabels.$inferInsert
export type Author = typeof authors.$inferInsert
export type ConversationUser = typeof conversationsUsers.$inferInsert
export type ConversationAssignee = typeof conversationsAssignees.$inferInsert
export type ConversationAssigneeHistory = typeof conversationsAssigneesHistory.$inferInsert
export type Organization = typeof organizations.$inferInsert
export type ConversationAuthor = typeof conversationsAuthors.$inferInsert
export type TwilioMessage = typeof twilioMessages.$inferInsert
export type InvokeHistory = typeof invokeHistory.$inferInsert
export type BroadcastSegment = typeof broadcastsSegments.$inferInsert
export type Broadcast = typeof broadcasts.$inferInsert
export type OutgoingMessage = typeof outgoingMessages.$inferInsert
export type BroadcastMessageStatus = typeof broadcastSentMessageStatus.$inferInsert
export type AudienceSegment = typeof audienceSegments.$inferInsert
export type UnsubscribedMessage = typeof unsubscribedMessages.$inferInsert
