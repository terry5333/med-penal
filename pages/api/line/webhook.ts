import type { NextApiRequest, NextApiResponse } from "next";

import { admin, getDb } from "../../../lib/firebaseAdmin";
import { replyMessage, verifySignature } from "../../../lib/line";

export const config = {
  api: {
    bodyParser: false,
  },
};

function getRawBody(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  const secret = process.env.LINE_CHANNEL_SECRET || "";
  if (!secret) {
    return res.status(500).send("Missing LINE_CHANNEL_SECRET");
  }

  const rawBody = await getRawBody(req);
  const signature = req.headers["x-line-signature"] as string | undefined;
  if (!verifySignature(rawBody, signature ?? null, secret)) {
    return res.status(401).send("Invalid signature");
  }

  const payload = JSON.parse(rawBody) as {
    events: Array<{
      type: string;
      replyToken?: string;
      source: { userId: string };
      postback?: { data: string };
    }>;
  };

  await Promise.all(
    payload.events.map(async (event) => {
      if (event.type !== "postback" || !event.replyToken || !event.postback) return;
      const params = new URLSearchParams(event.postback.data);
      if (params.get("action") !== "TAKE_MED") return;

      await db.collection("intakes").add({
        userId: event.source.userId,
        medId: params.get("medId"),
        scheduleId: params.get("scheduleId"),
        status: "taken",
        takenTime: admin.firestore.FieldValue.serverTimestamp(),
      });

      await replyMessage(event.replyToken, [{ type: "text", text: "已幫你記錄服藥 ✅" }]);
    })
  );

  return res.status(200).send("ok");
}
