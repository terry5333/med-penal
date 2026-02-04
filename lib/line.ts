import crypto from "crypto";

type LineMessage = {
  type: string;
  [key: string]: unknown;
};

export function verifySignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const hmac = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");
  return hmac === signature;
}

export function buildReminderFlex({
  medicationName,
  timeLabel,
  medId,
  scheduleId,
}: {
  medicationName: string;
  timeLabel: string;
  medId: string;
  scheduleId: string;
}) {
  return {
    type: "flex",
    altText: "用藥提醒",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "該吃藥囉！", weight: "bold", size: "lg" },
          { type: "text", text: `藥品：${medicationName}`, margin: "md" },
          { type: "text", text: `時間：${timeLabel}`, margin: "sm", color: "#666666" },
        ],
      },
      footer: {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "button",
            style: "primary",
            action: {
              type: "postback",
              label: "已服藥",
              data: `action=TAKE_MED&medId=${medId}&scheduleId=${scheduleId}`,
            },
          },
          {
            type: "button",
            style: "secondary",
            action: { type: "message", label: "回報副作用", text: "我要回報副作用" },
          },
        ],
      },
    },
  } satisfies LineMessage;
}

async function lineFetch(path: string, body: object) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
  if (!token) {
    throw new Error("Missing LINE_CHANNEL_ACCESS_TOKEN");
  }
  const res = await fetch(`https://api.line.me/v2/bot/message/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LINE API error: ${res.status} ${text}`);
  }
}

export async function replyMessage(replyToken: string, messages: LineMessage[]) {
  return lineFetch("reply", { replyToken, messages });
}

export async function pushMessage(to: string, messages: LineMessage[]) {
  return lineFetch("push", { to, messages });
}
