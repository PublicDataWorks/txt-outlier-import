export type UserField = {
  id: string | null;
  username: string;
  name: string | null
};


export type RequestBody = {
  messages: Message;
}

type Message = {
  account: string | undefined;
  body: string;
  references: string[];
  delivered_at: number;
  from_field: UserField;
  to_fields: UserField[];
};

export type Row = {
  first_name: string | null;
  last_name: string | null;
  user_id: string;
  phone: string;
  message_text: string;
  outbound: boolean;
  message_date: number;
  message_id: number
};
