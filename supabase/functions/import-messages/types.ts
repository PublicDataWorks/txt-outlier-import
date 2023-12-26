export type UserField = {
  id: string | null;
  username: string;
};

export type RequestBody = {
  messages: Message;
};

type Message = {
  account: string | undefined;
  body: string;
  references: string[];
  delivered_at: number;
  from_field: UserField;
  to_fields: UserField[];
};

export type Row = {
  message_text: string;
  outbound: boolean;
  message_date: number;
  message_id: number;
  phone: string;
};
