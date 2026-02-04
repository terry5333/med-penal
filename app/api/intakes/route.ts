import { db, admin } from "../../../lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    userId: string;
    medId: string;
    scheduleId?: string;
    takenTime?: string;
  };

  const doc = await db.collection("intakes").add({
    userId: body.userId,
    medId: body.medId,
    scheduleId: body.scheduleId || null,
    status: "taken",
    takenTime: body.takenTime
      ? admin.firestore.Timestamp.fromDate(new Date(body.takenTime))
      : admin.firestore.FieldValue.serverTimestamp(),
  });

  return Response.json({ ok: true, intakeId: doc.id });
}
