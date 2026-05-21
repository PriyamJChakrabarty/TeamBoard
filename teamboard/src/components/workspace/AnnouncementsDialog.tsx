"use client"

export type AnnouncementEntry = {
  id: string
  title: string
  body: string
}

export type AnnouncementsOpenDetail = {
  taskTitle: string
  announcements: AnnouncementEntry[]
}

export function AnnouncementsDialog({
  taskTitle,
  announcements,
  onClose,
}: {
  taskTitle: string
  announcements: AnnouncementEntry[]
  onClose: () => void
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 560,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #f97316 0%, #db2777 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🎙️</span>
            <div>
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.75)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                Announcements for
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {taskTitle}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: "pointer",
              color: "#fff",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          {announcements.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 24px",
                gap: 12,
                color: "#94a3b8",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              <span style={{ fontSize: 40 }}>📭</span>
              <div style={{ fontSize: 14, fontWeight: 600 }}>No announcements yet</div>
              <div style={{ fontSize: 12, textAlign: "center" }}>
                Connect an announcement card to this task card using the edge dots.
              </div>
            </div>
          ) : (
            announcements.map((a) => (
              <div
                key={a.id}
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 2px 12px rgba(219,39,119,0.15)",
                }}
              >
                {/* Mini card header */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #f97316 0%, #db2777 100%)",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 16 }}>🎙️</span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#fff",
                      fontFamily: "system-ui, sans-serif",
                      flex: 1,
                    }}
                  >
                    {a.title || "Untitled Announcement"}
                  </span>
                </div>
                {/* Body */}
                {a.body && (
                  <div
                    style={{
                      background: "#fff8f5",
                      padding: "10px 14px",
                      fontSize: 12,
                      color: "#374151",
                      lineHeight: 1.6,
                      fontFamily: "system-ui, sans-serif",
                      borderTop: "1px solid rgba(249,115,22,0.15)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {a.body}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
