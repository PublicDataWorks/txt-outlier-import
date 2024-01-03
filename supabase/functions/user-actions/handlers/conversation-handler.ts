import {PostgresJsDatabase, PostgresJsTransaction} from "npm:drizzle-orm/postgres-js";
import {upsertConversation, upsertRule} from "../utils.ts";
import {RequestBody, RequestConversation, RuleType} from "../types.ts";
import {
  ConversationAssignee, ConversationAssigneeHistory,
  conversationHistory,
  conversationsAssignees, conversationsAssigneesHistory,
  conversationsLabels
} from "../drizzle/schema.ts";
import {eq} from "npm:drizzle-orm";
import {pruneConversationAssignee, pruneConversationAssigneeHistory} from "../pruner.ts";

export const handleConversationClosed = async (
  db: PostgresJsDatabase,
  requestBody: RequestBody,
  changeType: string
) => {
  await db.transaction(async (tx) => {
    await upsertRule(tx, requestBody.rule);
    await upsertConversation(tx, requestBody.conversation, changeType === RuleType.ConversationClosed);
    const convoHistory = {
      conversationId: requestBody.conversation.id,
      changeType: changeType,
    };
    await tx.insert(conversationHistory).values(convoHistory).returning({inserted_history_id: conversationHistory.id});
  });
};

export const handleConversationAssigneeChange = async (
  db: PostgresJsDatabase,
  requestBody: RequestBody,
) => {
  await db.transaction(async (tx) => {
    await upsertRule(tx, requestBody.rule);
    await upsertConversation(tx, requestBody.conversation);
    const convoHistory = {
      conversationId: requestBody.conversation.id,
      changeType: RuleType.ConversationAssigneeChange,
    };
    const inserted = await tx.insert(conversationHistory).values(convoHistory).returning({inserted_history_id: conversationHistory.id});
    await upsertConversationsAssignees(tx, requestBody.conversation, inserted[0].inserted_history_id)
  });
};

const upsertConversationsAssignees = async (
  // deno-lint-ignore no-explicit-any
  tx: PostgresJsTransaction<any, any>,
  requestConvo: RequestConversation,
  convo_history_id: number
) => {
  if (requestConvo.assignees.length === 0) return;
  const assignees: ConversationAssignee[] = [];
  const history: ConversationAssigneeHistory[] = [];
  for (const assignee of requestConvo.assignees) {
    assignees.push(pruneConversationAssignee(assignee, requestConvo.id));
    history.push(pruneConversationAssigneeHistory(assignee, convo_history_id));
  }
  await tx.delete(conversationsAssignees).where(
    eq(conversationsAssignees.conversationId, requestConvo.id!),
  );
  await tx.insert(conversationsAssignees).values(assignees)
  await tx.insert(conversationsAssigneesHistory).values(history)
}
