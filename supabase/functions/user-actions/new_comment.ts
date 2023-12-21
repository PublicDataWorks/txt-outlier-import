import {
  AppError,
  Comment,
  RequestBody,
  RequestComment,
  RequestUser,
} from "./types.ts";
import { addUserHistory, upsertRule, upsertUser } from "./utils.ts";
import {drizzle, PostgresJsDatabase} from 'drizzle-orm/postgres-js'
import {comments} from "./drizzle/schema.ts";

export const handle_new_comment = async (
  db: drizzle,
  requestBody: RequestBody,
) => {
  await upsertRule(db, requestBody.rule);
  await upsertAuthor(db, requestBody.comment.author);
  await insertComment(db, requestBody.comment);
};

export const upsertAuthor = async (
    db: drizzle,
    user: RequestUser,
) => {
  await addUserHistory(db, user);
  await upsertUser(db, user);
};

const insertComment = async (
    db: PostgresJsDatabase,
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
  const { error } = await db.insert(comments).values([comment])
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
    db: drizzle,
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
    db: drizzle,
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
