import { AppError, RequestBody, RequestRule, RequestUser } from "./types.ts";
import { drizzle } from 'npm:drizzle-orm/postgres-js'

export const upsertRule = async (
    db: drizzle,
  request_rule: RequestRule,
) => {
  const rule = {
    id: request_rule.id,
    description: request_rule.description,
    type: request_rule.type,
  };
  const { error } = await client
    .from("rules")
    .upsert([rule], { onConflict: "id" });
  if (error) {
    throw new AppError(`Failed to insert rule: ${error.message}`);
  }
};

export const handleError = async (
    db: drizzle,
  request_body: RequestBody,
  app_error: AppError,
) => {
  const err = {
    rule_id: request_body.rule.id,
    rule_description: request_body.rule.description,
    rule_type: request_body.rule.type,
    message: app_error.message,
    request_body: request_body,
  };
  const { error } = await client
    .from("errors")
    .insert([err]);
  if (error) {
    console.error(
      `Failed to insert error: ${error.message}. Data: ${
        JSON.stringify(request_body)
      }, ${JSON.stringify(app_error)}`,
    );
  }
};

export const addUserHistory = async (
    db: drizzle,
  user: RequestUser,
) => {
  const { id: user_id, email, name, avatar_url } = user;
  const { data, error } = await supabase
    .from("users")
    .select("email, name, avatar_url")
    .eq("id", user_id)
    .order("id", { ascending: false })
    .limit(1);
  if (error) {
    throw new AppError(`Failed to fetch user. Data: ${user_id}`);
  }
  if (
    (data.length === 1 &&
      (data[0].email !== email || data[0].name !== name ||
        data[0].avatar_url !== avatar_url))
  ) {
    const new_user = { user_id, email, name, avatar_url };
    const { error } = await supabase.from("user_history").insert([new_user]);
    if (error) {
      throw new AppError(
        `Failed to insert user_history: ${error.message}. Data: ${
          JSON.stringify(new_user)
        }`,
      );
    }
  }
};

export const upsertUser = async (
    db: drizzle,
  user: RequestUser,
) => {
  const { error: upsertError } = await supabase
    .from("users")
    .upsert([
      {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
      },
    ], { onConflict: "id" });
  if (upsertError) {
    throw new AppError(
      `Failed to upsert author. Error: ${upsertError.message}, data: ${
        JSON.stringify(user)
      }`,
    );
  }
};
