import {AppError, CommentRecord, RequestBody, RequestComment, RequestRule, RuleType, RequestUser} from "./types.ts";
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js';
export const upsertRule = async (client: SupabaseClient, request_rule: RequestRule) => {
  const rule = {
    id: request_rule.id,
    description: request_rule.description,
    type: request_rule.type
  }
  const {_, error} = await client
      .from('rules')
      .upsert([rule], { onConflict: 'id' });
  if (error) {
    throw new AppError(`Failed to insert rule: ${error.message}`);
  }
}

export const handleError = async (client: SupabaseClient, request_body: RequestBody, app_error: AppError) => {
  const err = {
    rule_id: request_body.rule.id,
    rule_description:  request_body.rule.description,
    rule_type: request_body.rule.type,
    message: app_error.message,
    request_body: request_body,
  }
  const {_, error} = await client
      .from('errors')
      .insert([err]);
  if (error) {
    console.error(`Failed to insert error: ${error.message}. Data: ${JSON.stringify(request_body)}, ${JSON.stringify(app_error)}`)
  }
}

export const add_user_history = async (supabase: SupabaseClient, id: string, name: string, email: string, avatar_url: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('email, name, avatar_url')
    .eq('id', id)
    .order('id', { ascending: false })
    .limit(1)
  if (error) {
    throw new AppError(`Failed to fetch author. Data: ${id}`);
  }
  if (data.length === 1 && (data[0].email !== email || data[0].name !== name || data[0].avatar_url !== avatar_url)) {
    const new_user = { user_id: id, email, name, avatar_url };
    const {_, error} = await supabase.from('user_history').insert([new_user]);
    if (error) {
      throw new AppError(`Failed to insert user_history: ${error.message}. Data: ${JSON.stringify(new_user)}`);
    }
  }
}