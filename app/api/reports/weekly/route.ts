import { db } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);

  const snapshot = await db
    .collection("intakes")
    .where("userId", "==", userId)
    .where("scheduledTime", ">=", start)
    .where("scheduledTime", "<=", end)
    .get();

  const total = snapshot.size;
  const taken = snapshot.docs.filter((doc) => doc.data().status === "taken").length;
  const pending = snapshot.docs.filter((doc) => doc.data().status === "pending").length;

  return Response.json({
    range: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
    total,
    taken,
    pending,
    adherenceRate: total ? Math.round((taken / total) * 100) : 0,
  });
}
