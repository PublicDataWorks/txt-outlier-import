export type RequestComment = {
  id: string;
  body: string;
  mentions: (MentionUser | MentionTeam)[];
  created_at: number;
  attachment: null | string;
  task: null | RequestTask;
  author: RequestUser;
};

export type RequestUser = {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
};

export type RequestTask = {
  completed_at: number;
  assignees: RequestUser[];
};

export type RequestBody = {
  rule: RequestRule;
  conversation: RequestConversation;
  comment: RequestComment;
  latest_message: object;
};

export type RequestRule = {
  id: string;
  description: string;
  type: RuleType;
};

export enum RuleType {
  NewComment = "new_comment",
  TeamChanged = "team_change",
  LabelChanged = "label_change",
  ConversationClosed = "conversation_closed",
  ConversationReopened = "conversation_reopened",
  ConversationAssigneeChange = "conversation_assignee_change",
}

export type MentionUser = {
  user_id: string;
  offset: number;
  length: number;
};

export type MentionTeam = {
  team_id: string;
  offset: number;
  length: number;
};

export type RequestConversation = {
  id: string;
  created_at: number;
  subject: string | null;
  latest_message_subject: string | null;
  organization: RequestOrganization;
  messages_count: number;
  drafts_count: number;
  send_later_messages_count: number;
  attachments_count: number;
  tasks_count: number;
  completed_tasks_count: number;
  assignee_names: string | null;
  assignee_emails: string | null;
  shared_label_names: string | null;
  web_url: string;
  app_url: string;
  shared_labels: RequestLabel[];
  users: RequestConversationUser[];
  authors: RequestAuthor[];
  assignees: RequestConversationUser[];
};

export type RequestOrganization = {
  id: string;
  name: string;
};

export type RequestAuthor = {
  name: string;
  phone_number: string;
};

export type RequestConversationUser = {
  id: string;
  name: string;
  email: string;
  unassigned: boolean;
  closed: boolean;
  archived: boolean;
  trashed: boolean;
  junked: boolean;
  assigned: boolean;
  flagged: boolean;
  snoozed: boolean;
};

export type RequestLabel = {
  id: string;
  name: string;
  name_with_parent_names: string;
  organization: string;
  color: string | null;
  parent: string | null;
  share_with_organization: boolean;
  visibility: string | null;
};

export interface ReplacementDictionary {
  failureHost: string
  failureDetails: string;
  failedRequestDetails?: any | null;
  failedRule: string | null;
}