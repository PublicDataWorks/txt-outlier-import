import {
MentionTeam,
MentionUser,
  RequestBody,
  RequestComment,
  RequestTask,
} from "../types.ts";
import {upsertConversation, upsertRule, upsertUsers} from "../utils.ts";
import {
  PostgresJsDatabase,
  PostgresJsTransaction,
} from "npm:drizzle-orm/postgres-js";
import {
  Comment,
  CommentMention,
  comments,
  commentsMentions,
  tasksAssignees,
} from "../drizzle/schema.ts";

export const handleNewComment = async (
  db: PostgresJsDatabase,
  requestBody: RequestBody,
) => {
  await db.transaction(async (tx) => {
    await upsertRule(tx, requestBody.rule);
    const users = [
      requestBody.comment.author,
      ...requestBody.comment.task?.assignees ?? [],
    ];
    const mentions = requestBody.comment.mentions;
    for (const mention of mentions) {
      if ("user_id" in mention) {
        users.push({
          id: mention.user_id,
          email: "",
          name: "",
          avatar_url: "",
        });
      }
    }
    const uniqueUsers = users.filter((current, index, array) =>
      array.findIndex((e) => (e.id === current.id)) === index
    );
    await upsertUsers(tx, uniqueUsers);
    await upsertConversation(tx, requestBody.conversation);
    await insertComment(tx, requestBody);
  });
};

const insertComment = async (
  // deno-lint-ignore no-explicit-any
  tx: PostgresJsTransaction<any, any>,
  requestBody: RequestBody,
) => {
  const requestComment = requestBody.comment;
  const comment: Comment = {
    id: requestComment.id,
    body: requestComment.body,
    createdAt: String(new Date(requestComment.created_at * 1000)),
    attachment: requestComment.attachment,
    taskCompletedAt: requestComment?.task?.completed_at
      ? String(new Date(requestComment.task.completed_at * 1000))
      : null,
    isTask: !!requestComment.task,
    authorId: requestComment.author.id!,
    conversationId: requestBody.conversation.id,
  };
  await tx.insert(comments).values(comment);
  if (requestComment.task) {
    await insertTask(tx, requestComment.task, requestComment.id);
  }
  await insertMentions(tx, requestComment.mentions, requestComment.id);
};

const insertTask = async (
  // deno-lint-ignore no-explicit-any
  tx: PostgresJsTransaction<any, any>,
  task: RequestTask,
  commentId: string,
) => {
  if (task.assignees.length === 0) return;
  const assignees = [];
  for (const assignee of task.assignees) {
    assignees.push({
      commentId: commentId,
      userId: assignee.id,
    });
  }
  const uniqueAssignees = assignees.filter((current, index, array) =>
    array.findIndex((e) => (e.userId === current.userId)) === index
  );
  await tx
    .insert(tasksAssignees)
    .values(uniqueAssignees);
};

const insertMentions = async (
  // deno-lint-ignore no-explicit-any
  tx: PostgresJsTransaction<any, any>,
  mentions: (MentionUser | MentionTeam)[],
  commentId: string,
) => {
  if (mentions.length === 0) return;
  const mentionData: CommentMention[] = [];
  for (const mention of mentions) {
    if ("user_id" in mention) {
      mentionData.push({
        commentId: commentId,
        userId: mention.user_id,
        teamId: null,
        isUser: true,
      });
    } else if ("team_id" in mention) {
      mentionData.push({
        commentId: commentId,
        userId: null,
        teamId: mention.team_id,
        isUser: false,
      });
    }
  }
  const uniqueMentions = mentionData.filter((current, index, array) =>
    array.findIndex(
      (e) => (e.userId === current.userId && e.teamId === current.teamId),
    ) === index
  );

  // TODO: mention all
  // TODO: Exclude team_id for now
  await tx
    .insert(commentsMentions)
    .values(uniqueMentions);
};
