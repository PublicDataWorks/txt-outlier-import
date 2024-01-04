import {
  afterAll,
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.210.0/testing/bdd.ts";
import { drizzle } from "npm:drizzle-orm/postgres-js";
import postgres from "npm:postgres";
import { newCommentRequest } from "./fixtures/new-comment.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.210.0/assert/mod.ts";

import {
  comments,
  commentsMentions,
  conversations,
  tasksAssignees,
  users,
} from "../drizzle/schema.ts";
import { MentionUser } from "../types.ts";
import { db, req } from "./utils.ts";
import {conversationCLosedRequest} from "./fixtures/conversation-change-request.ts";
import {labelChangeRequest} from "./fixtures/label-change-request.ts";

describe(
  "Conversation change",
  { sanitizeOps: false, sanitizeResources: false },
  () => {
    it("new", async () => {
      const existingConvo = await db.select().from(conversations);
      assertEquals(existingConvo.length, 0);

      await req(JSON.stringify(conversationCLosedRequest));

      const newConvo = await db.select().from(conversations);
      assertEquals(newConvo.length, 1);
      assertEquals(newConvo[0].id, conversationCLosedRequest.conversation.id);
      assertEquals(newConvo[0].createdAt.toString(), String(new Date(conversationCLosedRequest.conversation.created_at * 1000)));
      assertEquals(newConvo[0].subject, conversationCLosedRequest.conversation.subject);
      assertEquals(newConvo[0].messagesCount, conversationCLosedRequest.conversation.messages_count);
      assertEquals(newConvo[0].draftsCount, conversationCLosedRequest.conversation.drafts_count);
      assertEquals(newConvo[0].sendLaterMessagesCount, conversationCLosedRequest.conversation.send_later_messages_count);
      assertEquals(newConvo[0].attachmentsCount, conversationCLosedRequest.conversation.attachments_count);
      assertEquals(newConvo[0].tasksCount, conversationCLosedRequest.conversation.tasks_count);
      assertEquals(newConvo[0].completedTasksCount, conversationCLosedRequest.conversation.completed_tasks_count);
      assertEquals(newConvo[0].assigneeNames, conversationCLosedRequest.conversation.assignee_names);
      assertEquals(newConvo[0].assigneeEmails, conversationCLosedRequest.conversation.assignee_emails);
      assertEquals(newConvo[0].sharedLabelNames, conversationCLosedRequest.conversation.shared_label_names);
      assertEquals(newConvo[0].webUrl, conversationCLosedRequest.conversation.web_url);
      assertEquals(newConvo[0].appUrl, conversationCLosedRequest.conversation.app_url);
      assertEquals(newConvo[0].organizationId, conversationCLosedRequest.conversation.organization.id);
      assertEquals(newConvo[0].teamId, conversationCLosedRequest.conversation.team!.id);
      assert(newConvo[0].closed);
    });
  },
);
