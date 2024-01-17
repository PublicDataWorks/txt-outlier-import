import { RequestBody } from "../../types.ts";

export const conversationCLosedRequest: RequestBody = {
  rule: {
    id: "eaea532e-ddb4-4e37-ad84-814a5f46181d",
    description: "Conversation closed",
    type: "conversation_closed",
  },
  conversation: {
    id: "e8196c2f-4bc9-4fa1-a018-6a4078362ed1",
    created_at: 1704181890,
    subject: "kytest",
    latest_message_subject: null,
    organization: {
      id: "7deec8a7-439a-414c-a10a-059142216786",
      name: "Outlier Staging",
    },
    color: null, // FIXME
    authors: [],
    external_authors: [],
    messages_count: 0,
    drafts_count: 0,
    send_later_messages_count: 0,
    attachments_count: 0,
    tasks_count: 3,
    completed_tasks_count: 1,
    users: [
      {
        id: "2d98b928-c3be-4cc6-8087-0baa2235e86e",
        name: "User 1",
        email: "user1@mail.com",
        unassigned: false,
        closed: false,
        archived: true,
        trashed: false,
        junked: false,
        assigned: false,
        flagged: false,
        snoozed: false,
      },
      {
        id: "6335aa04-e15b-4e23-ad0e-e41cdc1295a5",
        name: "User 2",
        email: "user2@mail.com",
        unassigned: false,
        closed: false,
        archived: true,
        trashed: false,
        junked: false,
        assigned: false,
        flagged: false,
        snoozed: false,
      },
      {
        id: "815e18a9-eab9-4b89-8227-de6518f5d987",
        name: "User 3",
        email: "user3@mail.com",
        unassigned: false,
        closed: false,
        archived: false,
        trashed: false,
        junked: false,
        assigned: true,
        flagged: false,
        snoozed: false,
      },
      {
        id: "cd89f926-901a-4d36-83eb-4f7e8881118d",
        name: "User 4",
        email: "user4@mail.com",
        unassigned: false,
        closed: false,
        archived: true,
        trashed: false,
        junked: false,
        assigned: false,
        flagged: false,
        snoozed: false,
      },
    ],
    assignees: [
      {
        id: "815e18a9-eab9-4b89-8227-de6518f5d987",
        name: "User 3",
        email: "user3@mail.com",
        unassigned: false,
        closed: false,
        archived: false,
        trashed: false,
        junked: false,
        assigned: true,
        flagged: false,
        snoozed: false,
      },
    ],
    assignee_names: "User 3",
    assignee_emails: "user3@mail.com",
    shared_label_names: "Parent Test, Nested test",
    web_url:
      "https://mail.missiveapp.com/#inbox/conversations/e8196c2f-4bc9-4fa1-a018-6a4078362ed1",
    app_url:
      "missive://mail.missiveapp.com/#inbox/conversations/e8196c2f-4bc9-4fa1-a018-6a4078362ed1",
    team: {
      id: "fb0b601e-7d6e-4248-8882-4f129fdfe43c",
      name: "Outlier Staging",
      organization: "7deec8a7-439a-414c-a10a-059142216786",
    },
    shared_labels: [
      {
        id: "13405e0f-8551-4ea7-a303-7552aee0bce4",
        name: "Parent Test",
        name_with_parent_names: "Parent Test",
        organization: "7deec8a7-439a-414c-a10a-059142216786",
        color: "#EE3430",
        parent: null,
        share_with_organization: false,
        share_with_users: [],
        share_with_team: null,
        visibility: "organization",
      },
      {
        id: "37113989-97e3-4121-a903-f85af6bfaaa0",
        name: "Nested test",
        name_with_parent_names: "Parent Test/Nested test",
        organization: "7deec8a7-439a-414c-a10a-059142216786",
        color: "#50A8FF",
        parent: "13405e0f-8551-4ea7-a303-7552aee0bce4",
        share_with_organization: false,
        share_with_users: [],
        share_with_team: null,
        visibility: "organization",
      },
    ],
  },
};

export const conversationReopenedRequest: RequestBody = {
  rule: {
    id: "370517ab-47da-4521-a484-3e117289dc9e",
    description: "Conversation reopened",
    type: "conversation_reopened",
  },
  conversation: {
    id: "e8196c2f-4bc9-4fa1-a018-6a4078362ed1",
    created_at: 1704181890,
    subject: "kytest",
    latest_message_subject: null,
    organization: {
      id: "7deec8a7-439a-414c-a10a-059142216786",
      name: "Outlier Staging",
    },
    color: null, // FIXME
    authors: [],
    external_authors: [],
    messages_count: 0,
    drafts_count: 0,
    send_later_messages_count: 0,
    attachments_count: 0,
    tasks_count: 3,
    completed_tasks_count: 1,
    users: [
      {
        id: "2d98b928-c3be-4cc6-8087-0baa2235e86e",
        name: "User 1",
        email: "user1@mail.com",
        unassigned: false,
        closed: false,
        archived: true,
        trashed: false,
        junked: false,
        assigned: false,
        flagged: false,
        snoozed: false,
      },
      {
        id: "6335aa04-e15b-4e23-ad0e-e41cdc1295a5",
        name: "User 2",
        email: "user2@mail.com",
        unassigned: false,
        closed: false,
        archived: true,
        trashed: false,
        junked: false,
        assigned: false,
        flagged: false,
        snoozed: false,
      },
      {
        id: "815e18a9-eab9-4b89-8227-de6518f5d987",
        name: "User 3",
        email: "user3@mail.com",
        unassigned: false,
        closed: false,
        archived: false,
        trashed: false,
        junked: false,
        assigned: true,
        flagged: false,
        snoozed: false,
      },
      {
        id: "cd89f926-901a-4d36-83eb-4f7e8881118d",
        name: "User 4",
        email: "user4@mail.com",
        unassigned: false,
        closed: false,
        archived: true,
        trashed: false,
        junked: false,
        assigned: false,
        flagged: false,
        snoozed: false,
      },
    ],
    assignees: [
      {
        id: "815e18a9-eab9-4b89-8227-de6518f5d987",
        name: "User 3",
        email: "user3@mail.com",
        unassigned: false,
        closed: false,
        archived: false,
        trashed: false,
        junked: false,
        assigned: true,
        flagged: false,
        snoozed: false,
      },
    ],
    assignee_names: "User 3",
    assignee_emails: "user3@mail.com",
    shared_label_names: "Parent Test, Nested test",
    web_url:
      "https://mail.missiveapp.com/#inbox/conversations/e8196c2f-4bc9-4fa1-a018-6a4078362ed1",
    app_url:
      "missive://mail.missiveapp.com/#inbox/conversations/e8196c2f-4bc9-4fa1-a018-6a4078362ed1",
    team: {
      id: "fb0b601e-7d6e-4248-8882-4f129fdfe43c",
      name: "Outlier Staging",
      organization: "7deec8a7-439a-414c-a10a-059142216786",
    },
    shared_labels: [
      {
        id: "13405e0f-8551-4ea7-a303-7552aee0bce4",
        name: "Parent Test",
        name_with_parent_names: "Parent Test",
        organization: "7deec8a7-439a-414c-a10a-059142216786",
        color: "#EE3430",
        parent: null,
        share_with_organization: false,
        share_with_users: [],
        share_with_team: null,
        visibility: "organization",
      },
      {
        id: "37113989-97e3-4121-a903-f85af6bfaaa0",
        name: "Nested test",
        name_with_parent_names: "Parent Test/Nested test",
        organization: "7deec8a7-439a-414c-a10a-059142216786",
        color: "#50A8FF",
        parent: "13405e0f-8551-4ea7-a303-7552aee0bce4",
        share_with_organization: false,
        share_with_users: [],
        share_with_team: null,
        visibility: "organization",
      },
    ],
  },
};

export const conversationAssigneeChangeRequest: RequestBody = {
  rule: {
    id: "370517ab-47da-4521-a484-3e117289dc9e",
    description: "Conversation assignee change",
    type: "conversation_assignee_change",
  },
  conversation: {
    id: "e8196c2f-4bc9-4fa1-a018-6a4078362ed1",
    created_at: 1704181890,
    subject: "kytest",
    latest_message_subject: null,
    organization: {
      id: "7deec8a7-439a-414c-a10a-059142216786",
      name: "Outlier Staging",
    },
    color: null, // FIXME
    authors: [],
    external_authors: [],
    messages_count: 0,
    drafts_count: 0,
    send_later_messages_count: 0,
    attachments_count: 0,
    tasks_count: 3,
    completed_tasks_count: 1,
    users: [
      {
        id: "2d98b928-c3be-4cc6-8087-0baa2235e86e",
        name: "User 1",
        email: "user1@mail.com",
        unassigned: false,
        closed: false,
        archived: true,
        trashed: false,
        junked: false,
        assigned: false,
        flagged: false,
        snoozed: false,
      },
      {
        id: "6335aa04-e15b-4e23-ad0e-e41cdc1295a5",
        name: "User 2",
        email: "user2@mail.com",
        unassigned: false,
        closed: false,
        archived: true,
        trashed: false,
        junked: false,
        assigned: false,
        flagged: false,
        snoozed: false,
      },
      {
        id: "815e18a9-eab9-4b89-8227-de6518f5d987",
        name: "User 3",
        email: "user3@mail.com",
        unassigned: false,
        closed: false,
        archived: false,
        trashed: false,
        junked: false,
        assigned: true,
        flagged: false,
        snoozed: false,
      },
      {
        id: "cd89f926-901a-4d36-83eb-4f7e8881118d",
        name: "User 4",
        email: "user4@mail.com",
        unassigned: false,
        closed: false,
        archived: true,
        trashed: false,
        junked: false,
        assigned: false,
        flagged: false,
        snoozed: false,
      },
    ],
    assignees: [
      {
        id: "815e18a9-eab9-4b89-8227-de6518f5d987",
        name: "User 3",
        email: "user3@mail.com",
        unassigned: false,
        closed: false,
        archived: false,
        trashed: false,
        junked: false,
        assigned: true,
        flagged: false,
        snoozed: false,
      },
    ],
    assignee_names: "User 3",
    assignee_emails: "user3@mail.com",
    shared_label_names: "Parent Test, Nested test",
    web_url:
      "https://mail.missiveapp.com/#inbox/conversations/e8196c2f-4bc9-4fa1-a018-6a4078362ed1",
    app_url:
      "missive://mail.missiveapp.com/#inbox/conversations/e8196c2f-4bc9-4fa1-a018-6a4078362ed1",
    team: {
      id: "fb0b601e-7d6e-4248-8882-4f129fdfe43c",
      name: "Outlier Staging",
      organization: "7deec8a7-439a-414c-a10a-059142216786",
    },
    shared_labels: [
      {
        id: "13405e0f-8551-4ea7-a303-7552aee0bce4",
        name: "Parent Test",
        name_with_parent_names: "Parent Test",
        organization: "7deec8a7-439a-414c-a10a-059142216786",
        color: "#EE3430",
        parent: null,
        share_with_organization: false,
        share_with_users: [],
        share_with_team: null,
        visibility: "organization",
      },
      {
        id: "37113989-97e3-4121-a903-f85af6bfaaa0",
        name: "Nested test",
        name_with_parent_names: "Parent Test/Nested test",
        organization: "7deec8a7-439a-414c-a10a-059142216786",
        color: "#50A8FF",
        parent: "13405e0f-8551-4ea7-a303-7552aee0bce4",
        share_with_organization: false,
        share_with_users: [],
        share_with_team: null,
        visibility: "organization",
      },
    ],
  },
};