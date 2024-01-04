import { describe, it } from "https://deno.land/std@0.210.0/testing/bdd.ts";
import { assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";

import { db, req } from "./utils.ts";
import { labelChangeRequest } from "./fixtures/label-change-request.ts";
import { labels } from "../drizzle/schema.ts";

describe(
  "Label change",
  { sanitizeOps: false, sanitizeResources: false },
  () => {
    it("new", async () => {
      const existingLabel = await db.select().from(labels);
      assertEquals(existingLabel.length, 0);
      await req(JSON.stringify(labelChangeRequest));

      const label = await db.select().from(labels);
      assertEquals(label.length, 1);
      const requestLabel = labelChangeRequest.conversation.shared_labels[0];
      assertEquals(label[0].name, requestLabel.name);
      assertEquals(
        label[0].nameWithParentNames,
        requestLabel.name_with_parent_names,
      );
      assertEquals(label[0].color, requestLabel.color);
      assertEquals(label[0].parent, requestLabel.parent);
      assertEquals(
        label[0].shareWithOrganization,
        requestLabel.share_with_organization,
      );
      assertEquals(label[0].visibility, requestLabel.visibility);
    });

    it("upsert", async () => {
      await req(JSON.stringify(labelChangeRequest));

      const newLabelChange = JSON.parse(JSON.stringify(labelChangeRequest));
      newLabelChange.conversation.shared_labels[0].name = "new name";
      await req(JSON.stringify(newLabelChange));

      const label = await db.select().from(labels);
      assertEquals(label.length, 1);

      const requestLabel = labelChangeRequest.conversation.shared_labels[0];
      assertEquals(label[0].name, "new name");
      assertEquals(
        label[0].nameWithParentNames,
        requestLabel.name_with_parent_names,
      );
      assertEquals(label[0].color, requestLabel.color);
      assertEquals(label[0].parent, requestLabel.parent);
      assertEquals(
        label[0].shareWithOrganization,
        requestLabel.share_with_organization,
      );
      assertEquals(label[0].visibility, requestLabel.visibility);
    });
  },
);
