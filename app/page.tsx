export const runtime = "nodejs";

export default function HomePage() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "32px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>
        長期服藥管理 LINE Bot MVP
      </h1>
      <p style={{ marginBottom: "16px", color: "#444" }}>
        這是 Firebase 版的 MVP 後端與管理後台入口，提供提醒、打卡與週報統計。
      </p>
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "16px",
          maxWidth: "640px",
        }}
      >
        <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>管理後台</h2>
        <p style={{ marginBottom: "12px", color: "#555" }}>
          透過管理後台查看近期打卡、藥品與排程統計。
        </p>
        <a
          href="/admin"
          style={{
            display: "inline-block",
            background: "#2563eb",
            color: "white",
            padding: "10px 16px",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          進入管理後台
        </a>
      </section>
    </main>
  );
}
