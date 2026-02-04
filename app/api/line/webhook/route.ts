import { admin, db } from "@/lib/firebaseAdmin";
import { replyMessage, verifySignature } from "@/lib/line";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.LINE_CHANNEL_SECRET || "";
  if (!secret) {
    return new Response("Missing LINE_CHANNEL_SECRET", { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-line-signature");
  if (!verifySignature(rawBody, signature, secret)) {
    return new Response("Invalid signature", { status: 401 });
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

      await replyMessage(event.replyToken, [
        { type: "text", text: "已幫你記錄服藥 ✅" },
      ]);
    })
  );

  return new Response("ok");
}
