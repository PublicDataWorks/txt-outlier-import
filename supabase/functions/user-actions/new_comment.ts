import {AppError, MentionTeam, MentionUser, RequestBody, RequestComment, RequestUser} from "./types.ts";
import {add_user_history, upsertRule} from "./utils.ts";
import {SupabaseClient} from "https://esm.sh/@supabase/supabase-js";


export const handle_new_comment = async (client: SupabaseClient, requestBody: RequestBody) => {
  await upsertRule(client, requestBody.rule)
  await upsertAuthor(client, requestBody.comment.author)
  await insertComment(client, requestBody.comment)

}

export const upsertAuthor = async (supabase: SupabaseClient, request_user: RequestUser) => {
  const { id, email, name, avatar_url } = request_user;
  const author = { id, email, name, avatar_url };
  await add_user_history(supabase, id, name, email, avatar_url)
  const { error: upsertError } = await supabase
    .from('users')
    .upsert([author], {onConflict: 'id'})
  if (upsertError) {
    throw new AppError(`Failed to upsert author: ${upsertError.message}. Data: ${JSON.stringify(author)}`);
  }
}

export const insertComment = async (supabase: SupabaseClient, request_comment: RequestComment) => {
  const { author, task, mentions, meta, ...comment } = request_comment;
  const mention_ids = new Set();

  for (const mention of mentions) {
    if ('user_id' in mention) {
      mention_ids.add({ user_id: mention.user_id, is_user: true });
    } else if ('team_id' in mention) {
      mention_ids.add({ team_id: mention.team_id, is_user: false });
    }
  }
  // TODO: mention all
  if (mention_ids.size > 0) {
    const { error } = await supabase
    .from('comments_mentions')
    .insert(mention_ids)
    if (error) {
      throw new AppError(`Failed to insert mentions. Data: ${mention_ids}`);
    }
  }

  if (task) {
    comment["task_completed_at"] = task.completed_at
    for (const assignee of task.assignees) {
      if (assignee.id !== author.id) {
        await add_user_history(supabase, assignee.id, assignee.name, assignee.email, assignee.avatar_url)
      }
      await supabase
        .from('comments')
        .insert([comment]);
    }
  }
  const {_, error} = await supabase
    .from('comments')
    .insert([comment]);
  if (error) {
    throw new AppError(`Failed to insert comment. Data: ${comment}`);
  }
}