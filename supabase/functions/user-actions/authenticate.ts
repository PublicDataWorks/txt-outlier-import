import { RequestBody } from "./types.ts";
import { decodeHex } from "https://deno.land/std@0.210.0/encoding/hex.ts";

export const verify = async (
  hash: string,
  requestBody: RequestBody,
): Promise<boolean> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(requestBody));

  const keyBuf = encoder.encode(Deno.env.get("HMAC_SECRET")!);

  const key = await crypto.subtle.importKey(
    "raw",
    keyBuf,
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign", "verify"],
  );

  const keyPrefix = "sha256=";
  const cleanedHeaderSig = hash.startsWith(keyPrefix)
    ? hash.slice(keyPrefix.length)
    : hash;

  const receivedSignature = decodeHex(cleanedHeaderSig);

  return await crypto.subtle.verify(
    { name: "HMAC", hash: "SHA-256" },
    key,
    receivedSignature,
    data.buffer,
  );
};
