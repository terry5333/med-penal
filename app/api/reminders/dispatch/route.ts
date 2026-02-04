import { db, admin } from "../../../../lib/firebaseAdmin";
import { buildReminderFlex, pushMessage } from "../../../../lib/line";
import { requirePanelToken } from "../../../../lib/security";

export const runtime = "nodejs";

function toTimeParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  });
  const timeLabel = formatter.format(date);

  const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone });
  const dayName = dayFormatter.format(date);
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return { timeLabel, dayIndex: dayMap[dayName] };
}

export async function POST(request: Request) {
  const auth = requirePanelToken(request);
  if (!auth.ok) return auth.res;

  const body = (await request.json().catch(() => ({}))) as {
    nowIso?: string;
    timeZone?: string;
  };
  const timeZone = body.timeZone || "Asia/Taipei";
  const now = body.nowIso ? new Date(body.nowIso) : new Date();
  const { timeLabel, dayIndex } = toTimeParts(now, timeZone);

  const schedulesSnap = await db.collection("schedules").where("active", "==", true).get();

  await Promise.all(
    schedulesSnap.docs.map(async (doc) => {
      const schedule = doc.data() as {
        userId: string;
        medId: string;
        times: string[];
        daysOfWeek: number[];
      };

      if (!schedule.times?.includes(timeLabel)) return;
      if (!schedule.daysOfWeek?.includes(dayIndex)) return;

      const medDoc = await db.collection("medications").doc(schedule.medId).get();
      const medicationName = medDoc.exists ? (medDoc.data()?.name as string) : "未命名藥品";

      await db.collection("intakes").add({
        userId: schedule.userId,
        medId: schedule.medId,
        scheduleId: doc.id,
        status: "pending",
        scheduledTime: admin.firestore.Timestamp.fromDate(now),
      });

      await pushMessage(schedule.userId, [
        buildReminderFlex({
          medicationName,
          timeLabel,
          medId: schedule.medId,
          scheduleId: doc.id,
        }),
      ]);
    })
  );

  return Response.json({ ok: true, dispatchedAt: now.toISOString() });
}
