import {
  AppError,
  Comment,
  RequestBody,
  RequestComment,
  RequestUser,
} from "./types.ts";
import { addUserHistory, upsertRule, upsertUser } from "./utils.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js";

export const handle_new_comment = async (
  client: SupabaseClient,
  requestBody: RequestBody,
) => {
  await upsertRule(client, requestBody.rule);
  await upsertAuthor(client, requestBody.comment.author);
  await insertComment(client, requestBody.comment);
};

export const upsertAuthor = async (
  supabase: SupabaseClient,
  user: RequestUser,
) => {
  await addUserHistory(supabase, user);
  await upsertUser(supabase, user);
};

const insertComment = async (
  supabase: SupabaseClient,
  request_comment: RequestComment,
) => {
  const comment: Comment = {
    id: request_comment.id,
    body: request_comment.body,
    created_at: new Date(request_comment.created_at * 1000),
    attachment: request_comment.attachment,
    task_completed_at: request_comment?.task?.completed_at
      ? new Date(request_comment.task.completed_at * 1000)
      : null,
    is_task: !!request_comment.task,
    author_id: request_comment.author.id,
  };
  const { error } = await supabase
    .from("comments")
    .insert([comment]);
  if (error) {
    throw new AppError(
      `Failed to insert comment. Error: ${error.message}, data: ${
        JSON.stringify(comment)
      }`,
    );
  }
  await insertTask(supabase, request_comment);
  await insertMentions(supabase, request_comment);
};

const insertTask = async (
  supabase: SupabaseClient,
  request_comment: RequestComment,
) => {
  if (request_comment.task) {
    const assignee_data = [];
    for (const assignee of request_comment.task.assignees) {
      if (assignee.id !== request_comment.author.id) {
        await addUserHistory(supabase, assignee);
        await upsertUser(supabase, assignee);
      }
      assignee_data.push({
        comment_id: request_comment.id,
        user_id: assignee.id,
      });
    }
    const unique_assignee_data = assignee_data.filter((current, index, array) =>
      array.findIndex((e) => (e.user_id === current.user_id)) === index
    );

    if (unique_assignee_data.length > 0) {
      const { error } = await supabase
        .from("tasks_assignees")
        .insert(unique_assignee_data);
      if (error) {
        throw new AppError(
          `Failed to insert assignee data. Error: ${error.message}, data: ${
            JSON.stringify(unique_assignee_data)
          }`,
        );
      }
    }
  }
};

const insertMentions = async (
  supabase: SupabaseClient,
  request_comment: RequestComment,
) => {
  const mention_data = [];
  for (const mention of request_comment.mentions) {
    if ("user_id" in mention) {
      mention_data.push({
        comment_id: request_comment.id,
        user_id: mention.user_id,
        team_id: null,
        is_user: true,
      });
    } else if ("team_id" in mention) {
      mention_data.push({
        comment_id: request_comment.id,
        user_id: null,
        team_id: mention.team_id,
        is_user: false,
      });
    }
  }
  const unique_mentions = mention_data.filter((current, index, array) =>
    array.findIndex(
      (e) => (e.user_id === current.user_id && e.team_id === current.team_id),
    ) === index
  );

  // TODO: mention all
  if (unique_mentions.length > 0) {
    // TODO: Exclude team_id for now
    const { error } = await supabase
      .from("users")
      .upsert(
        unique_mentions.filter((item) => item.is_user).map((item) => ({
          id: item.user_id,
        })),
        { onConflict: "id", ignoreDuplicates: true },
      );
    if (error) {
      throw new AppError(
        `Failed to insert mention ids. Error: ${error.message}, data: ${
          JSON.stringify(unique_mentions)
        }`,
      );
    }
    const { error: mention_error } = await supabase
      .from("comments_mentions")
      .insert(unique_mentions);
    if (mention_error) {
      throw new AppError(
        `Failed to insert comments_mentions. Error: ${mention_error.message}, data: ${
          JSON.stringify(unique_mentions)
        }`,
      );
    }
  }
};
