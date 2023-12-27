import { PostgresJsDatabase } from "npm:drizzle-orm/postgres-js";
import {
  ConversationLabel,
  conversationsLabels,
  Label,
  labels,
} from "../drizzle/schema.ts";
import { upsertConversation, upsertRule } from "../utils.ts";
import { RequestBody } from "../types.ts";
import { eq, sql } from "npm:drizzle-orm";

export const handleLabelChange = async (
  db: PostgresJsDatabase,
  requestBody: RequestBody,
) => {
  await db.transaction(async (tx) => {
    await upsertRule(tx, requestBody.rule);
    await upsertConversation(tx, requestBody.conversation, null);
    const requestLabels = new Set<Label>();
    const requestConversationsLabels = new Set<ConversationLabel>();
    for (const label of requestBody.conversation.shared_labels) {
      requestLabels.add({
        id: label.id,
        name: label.name,
        nameWithParentNames: label.name_with_parent_names,
        color: label.color,
        parent: label.parent,
        shareWithOrganization: label.share_with_organization,
        visibility: label.visibility,
      });
      requestConversationsLabels.add({
        conversationId: requestBody.conversation.id,
        labelId: label.id,
      });
    }

    if (requestLabels.size > 0) {
      await tx.insert(labels).values([...requestLabels]).onConflictDoUpdate({
        target: labels.id,
        set: {
          name: sql`excluded.name`,
          nameWithParentNames: sql`excluded.name_with_parent_names`,
          color: sql`excluded.color`,
          parent: sql`excluded.parent`,
          shareWithOrganization: sql`excluded.share_with_organization`,
          visibility: sql`excluded.visibility`,
        },
      });
    }
    if (requestConversationsLabels.size > 0) {
      await tx.delete(conversationsLabels).where(
        eq(conversationsLabels.conversationId, requestBody.conversation.id!),
      );
      await tx.insert(conversationsLabels).values([
        ...requestConversationsLabels,
      ]);
    }
  });
};
