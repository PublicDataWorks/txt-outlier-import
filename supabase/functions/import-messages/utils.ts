import { insertErrorQuery } from "./queries.ts";
import { RequestBody, UserField } from "./types.ts";
import {PoolClient} from "https://deno.land/x/postgres@v0.17.0/client.ts";

export const convertExcelDateToUnixTimestamp = (excelDate: number) => {
    const temp = new Date((excelDate - (25567 + 1)) * 24 * 60 * 60 * 1000);
    return Math.round(temp.getTime() / 1000);
};

const outlierField: UserField = {
  id: null,
  username: Deno.env.get('ACCOUNT_ALIAS') || '',
};
export const buildCreateMessageBody = (
    userPhone: string,
    message: string,
    outbound: boolean,
    messageDate: number
): RequestBody => {
    const userField: UserField = {
        id: userPhone,
        username: userPhone,
    };
    return {
        messages: {
          account: Deno.env.get('ACCOUNT_ID'),
          body: message,
          references: [userPhone],
          delivered_at: convertExcelDateToUnixTimestamp(messageDate),
          from_field: outbound ? outlierField : userField,
          to_fields: outbound ? [userField] : [outlierField]
        },
    };
};

export const sendError = async (
    client: PoolClient,
    message_id: number,
    response: Response,
) => {
    const code = response.status;
    const text = await response.text();
    console.error("Error occurred: ", code, text);
    await client.queryObject({
        text: insertErrorQuery,
        args: [message_id, code, text, new Date()]
    });
};

export const createMessageUrl = "https://public.missiveapp.com/v1/messages";
export const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${Deno.env.get('TOKEN')}`,
};
