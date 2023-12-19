export type RequestUser = {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
};

export type RequestComment = {
  id: string;
  body: string;
  mentions: (MentionUser | MentionTeam)[];
  created_at: number;
  attachment: null | string;
  task: null | RequestTask;
  author: RequestUser;
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

export enum RuleType {
  NewComment = "new_comment",
}

export type RequestRule = {
  id: string;
  description: string;
  type: RuleType;
};

export type Error = {
  rule_id: string;
  error_message: string
};

export type MentionUser = {
  user_id: string,
  offset: number,
  length: number
};

export type MentionTeam = {
  team_id: string,
  offset: number,
  length: number
};

export class AppError extends Error {}
