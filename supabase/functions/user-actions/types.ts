export type User = {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
};

export type RequestComment = {
  id: string;
  body: string;
  created_at: number;
  attachment: null | string;
  task: null | string;
  author: User;
};

export type CommentRecord = {
  id: string;
  body: string;
  created_at: Date;
  attachment: null | string;
  task_completed_at: null | Date;
  author_id: string;
};

export type RequestBody = {
  rule: Rule; // replace object with the actual type if known
  conversation: object; // replace object with the actual type if known
  comment: RequestComment;
  latest_message: object; // replace object with the actual type if known
};

enum RuleType {
  NewComment = "new_comment",
}

export type Rule = {
  id: string;
  description: string;
  type: RuleType;
};

export type Error = {
  rule_id: string;
  error_message: string
};

export class AppError extends Error {}
