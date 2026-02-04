import { admin, getDb } from "../../lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IntakeItem = {
  id: string;
  userId: string;
  medId: string;
  medicationName?: string;
  status: string;
  scheduledTime?: admin.firestore.Timestamp;
  takenTime?: admin.firestore.Timestamp;
};

function formatTimestamp(value?: admin.firestore.Timestamp) {
  if (!value) return "-";
  return value.toDate().toLocaleString("zh-TW", { hour12: false });
}

async function getDashboardData() {
  const db = getDb();
  const [medicationsSnap, schedulesSnap, intakesSnap] = await Promise.all([
    db.collection("medications").get(),
    db.collection("schedules").get(),
    db.collection("intakes").orderBy("scheduledTime", "desc").limit(10).get(),
  ]);

  const medicationNameMap = new Map(
    medicationsSnap.docs.map((doc) => [doc.id, doc.data().name as string])
  );

  const recentIntakes = intakesSnap.docs.map((doc) => {
    const data = doc.data() as Omit<IntakeItem, "id">;
    return {
      id: doc.id,
      ...data,
      medicationName: medicationNameMap.get(data.medId) || "未命名藥品",
    };
  });

  const takenCount = recentIntakes.filter((item) => item.status === "taken").length;
  const pendingCount = recentIntakes.filter((item) => item.status === "pending").length;

  return {
    totals: {
      medications: medicationsSnap.size,
      schedules: schedulesSnap.size,
      recentTaken: takenCount,
      recentPending: pendingCount,
    },
    recentIntakes,
  };
}

export default async function AdminPage() {
  const data = await getDashboardData();

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "32px" }}>
      <header style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "6px" }}>管理後台</h1>
        <p style={{ color: "#555" }}>
          使用 Firebase Admin 讀取最新服藥狀態，部署後可直接透過 Vercel 環境變數連線。
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          { label: "藥品數量", value: data.totals.medications },
          { label: "排程數量", value: data.totals.schedules },
          { label: "近期已服藥", value: data.totals.recentTaken },
          { label: "近期待服藥", value: data.totals.recentPending },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "16px",
              background: "#f9fafb",
            }}
          >
            <div style={{ color: "#6b7280", fontSize: "14px" }}>{item.label}</div>
            <div style={{ fontSize: "24px", fontWeight: 600 }}>{item.value}</div>
          </div>
        ))}
      </section>

      <section>
        <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>最近 10 筆服藥紀錄</h2>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f3f4f6" }}>
              <tr>
                {[
                  "狀態",
                  "用戶",
                  "藥品",
                  "預計時間",
                  "實際時間",
                ].map((header) => (
                  <th
                    key={header}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      fontSize: "14px",
                      color: "#374151",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentIntakes.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "16px", color: "#6b7280" }}>
                    尚無紀錄
                  </td>
                </tr>
              ) : (
                data.recentIntakes.map((item) => (
                  <tr key={item.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "10px 12px" }}>{item.status}</td>
                    <td style={{ padding: "10px 12px" }}>{item.userId}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <div>{item.medicationName}</div>
                      <div style={{ color: "#9ca3af", fontSize: "12px" }}>{item.medId}</div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {formatTimestamp(item.scheduledTime)}
                    </td>
                    <td style={{ padding: "10px 12px" }}>{formatTimestamp(item.takenTime)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
