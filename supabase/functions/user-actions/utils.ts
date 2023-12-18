import {AppError, CommentRecord, RequestBody, RequestComment, Rule, User} from "./types.ts";
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js';

export const convertRequestCommentToCommentRecord = (comment: RequestComment): CommentRecord => {
  const { author, task, mentions, meta, ...commentWithoutAuthor } = comment;
  return {
    ...commentWithoutAuthor,
    author_id: author.id,
    created_at: new Date(comment.created_at * 1000),
    task_completed_at: null,
  };
};

export const insertRule = async (client: SupabaseClient, rule: Rule) => {
  const {_, error} = await client
      .from('rules')
      .insert([rule]);
  if (error) {
    throw new AppError(`Failed to insert rule: ${error.message}`);
  }
}

export const upsertAuthor = async (client: SupabaseClient, author: User) => {
  const {_, error} = await client
      .from('users')
      .upsert([author], { onConflict: 'id' });
  if (error) {
    throw new AppError(`Failed to upsert author: ${error.message}. Data: ${JSON.stringify(author)}`);
  }
}

export const insertComment = async (client: SupabaseClient, comment: CommentRecord) => {
  const {_, error} = await client
      .from('comments')
      .insert([comment]);
  if (error) {
    throw new AppError(`Failed to insert comment: ${error.message}. Data: ${JSON.stringify(comment)}`);
  }
}

export const handleError = async (client: SupabaseClient, request_body: RequestBody, app_error: AppError) => {
  const err = {
    rule_id: request_body.rule.id,
    rule_description:  request_body.rule.description,
    rule_type: request_body.rule.type,
    message: app_error.message,
    request_body: request_body,
  }
  const {_, error} = await client
      .from('errors')
      .insert([err]);
  if (error) {
    console.log(`Failed to insert error: ${error.message}. Data: ${JSON.stringify(request_body)}, ${JSON.stringify(app_error)}`)
  }
}
