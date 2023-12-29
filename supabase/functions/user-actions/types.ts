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
  conversation: object;
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

export class AppError extends Error {}

export interface ReplacementDictionary {
  failureHost: string
  failureDetails: string;
  failedRequestDetails?: any | null;
  failedRule: string | null;
}