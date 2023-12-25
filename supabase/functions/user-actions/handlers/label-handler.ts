import { PostgresJsDatabase } from "npm:drizzle-orm/postgres-js";
import {
  ConversationLabel,
  ConversationLatest,
  conversationLatest,
  conversationsLabels,
  Label,
  labels,
} from "../drizzle/schema.ts";
import { upsertRule } from "../utils.ts";
import { RequestBody } from "../types.ts";
import { eq, sql } from "npm:drizzle-orm";

export const handleLabelChange = async (
  db: PostgresJsDatabase,
  requestBody: RequestBody,
) => {
  const requestConvo = requestBody.conversation;
  const convo: ConversationLatest = {
    uuid: requestConvo.id,
    createdAt: String(new Date(requestConvo.created_at * 1000)),
    subject: requestConvo.subject,
    latestMessageSubject: requestConvo.latest_message_subject,
    messagesCount: requestConvo.messages_count,
    draftsCount: requestConvo.drafts_count,
    sendLaterMessagesCount: requestConvo.send_later_messages_count,
    attachmentsCount: requestConvo.attachments_count,
    tasksCount: requestConvo.tasks_count,
    completedTasksCount: requestConvo.completed_tasks_count,
    assigneeNames: requestConvo.assignee_names,
    assigneeEmails: requestConvo.assignee_emails,
    sharedLabelNames: requestConvo.shared_label_names,
    webUrl: requestConvo.web_url,
    appUrl: requestConvo.app_url,
  };
  await db.transaction(async (tx) => {
    await upsertRule(tx, requestBody.rule);
    await tx.insert(conversationLatest).values(convo).onConflictDoUpdate({
      target: conversationLatest.uuid,
      set: { ...convo },
    });
    const requestLabels = new Set<Label>();
    const requestConversationsLabels = new Set<ConversationLabel>();
    for (const label of requestConvo.shared_labels) {
      requestLabels.add({
        uuid: label.id,
        name: label.name,
        nameWithParentNames: label.name_with_parent_names,
        color: label.color,
        parent: label.parent,
        shareWithOrganization: label.share_with_organization,
        visibility: label.visibility,
      });
      requestConversationsLabels.add({
        conversationUuid: convo.uuid,
        labelUuid: label.id,
      });
    }

    if (requestLabels.size > 0) {
      await tx.insert(labels).values([...requestLabels]).onConflictDoUpdate({
        target: labels.uuid,
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
        eq(conversationsLabels.conversationUuid, convo.uuid!),
      );
      await tx.insert(conversationsLabels).values([
        ...requestConversationsLabels,
      ]);
    }
  });
};
