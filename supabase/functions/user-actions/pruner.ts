import {
  Conversation,
  ConversationAssigneeHistory,
  ConversationUser,
  Organization,
  Rule,
} from "./drizzle/schema.ts";
import {
  RequestConversation,
  RequestConversationUser,
  RequestOrganization,
  RequestRule,
  RuleType,
} from "./types.ts";

export const pruneConversation = (
  requestConvo: RequestConversation,
): Conversation => {
  return {
    id: requestConvo.id,
    createdAt: String(new Date(requestConvo.created_at * 1000)),
    subject: requestConvo.subject,
    latestMessageSubject: requestConvo.latest_message_subject,
    messagesCount: requestConvo.messages_count,
    draftsCount: requestConvo.drafts_count,
    sendLaterMessagesCount: requestConvo.send_later_messages_count,
    attachmentsCount: requestConvo.attachments_count,
    tasksCount: requestConvo.tasks_count,
    completedTasksCount: requestConvo.completed_tasks_count,
    assigneeNames: requestConvo.assignee_names,
    assigneeEmails: requestConvo.assignee_emails,
    sharedLabelNames: requestConvo.shared_label_names,
    webUrl: requestConvo.web_url,
    appUrl: requestConvo.app_url,
    organizationId: requestConvo.organization.id,
  };
};

export const pruneRule = (requestRule: RequestRule): Rule => {
  return {
    id: requestRule.id,
    description: requestRule.description,
    type: requestRule.type,
  };
};

export const pruneOrg = (requestOrg: RequestOrganization): Organization => {
  return {
    id: requestOrg.id,
    name: requestOrg.name,
  };
};

export const pruneConversationUser = (
  user: RequestConversationUser,
  conversationId: string,
): ConversationUser => {
  return {
    conversationId,
    userId: user.id,
    unassigned: user.unassigned,
    closed: user.closed,
    archived: user.archived,
    trashed: user.trashed,
    junked: user.junked,
    assigned: user.assigned,
    flagged: user.flagged,
    snoozed: user.snoozed,
  };
};

export const pruneConversationAssignee = (
  assignee: RequestConversationUser,
  conversationId: string,
): ConversationUser => {
  return {
    conversationId,
    userId: assignee.id,
    unassigned: assignee.unassigned,
    closed: assignee.closed,
    archived: assignee.archived,
    trashed: assignee.trashed,
    junked: assignee.junked,
    assigned: assignee.assigned,
    flagged: assignee.flagged,
    snoozed: assignee.snoozed,
  };
};

export const pruneConversationAssigneeHistory = (
  assignee: RequestConversationUser,
  conversationHistoryId: number,
): ConversationAssigneeHistory => {
  return {
    unassigned: assignee.unassigned,
    closed: assignee.closed,
    archived: assignee.archived,
    trashed: assignee.trashed,
    junked: assignee.junked,
    assigned: assignee.assigned,
    flagged: assignee.flagged,
    snoozed: assignee.snoozed,
    conversationHistoryId,
  };
};
