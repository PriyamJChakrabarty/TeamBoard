"use client"

type TaskDetailModalProps = {
  shapeId: string
  title: string
  onClose: () => void
}

const MOCK_SUB_TASKS = [
  { id: "s1", title: "Book venue", status: "done" },
  { id: "s2", title: "Send invitations", status: "in-progress" },
  { id: "s3", title: "Arrange catering", status: "todo" },
  { id: "s4", title: "Setup AV equipment", status: "todo" },
]

const STATUS_COLOR: Record<string, string> = {
  done: "#22c55e",
  "in-progress": "#f59e0b",
  todo: "#94a3b8",
}

export function TaskDetailModal({ shapeId, title, onClose }: TaskDetailModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(2px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          width: "min(640px, 95vw)",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
              Task Sub-Canvas
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>{title}</h2>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0" }}>ID: {shapeId.slice(-8)}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              cursor: "pointer",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
            Sub-tasks
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {MOCK_SUB_TASKS.map((st) => (
              <div
                key={st.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: STATUS_COLOR[st.status],
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, fontSize: "13px", color: "#1e293b" }}>{st.title}</span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: STATUS_COLOR[st.status] + "22",
                    color: STATUS_COLOR[st.status],
                    textTransform: "capitalize",
                  }}
                >
                  {st.status.replace("-", " ")}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "24px", padding: "16px", borderRadius: "12px", background: "#f0f4ff", border: "1px dashed #6366f1" }}>
            <p style={{ fontSize: "12px", color: "#4338ca", margin: 0, fontWeight: 500 }}>
              🚀 In a future phase, this will open a full sub-canvas whiteboard where you can break this task into a nested workspace with its own cards, notes, and team view.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              background: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              color: "#64748b",
              cursor: "pointer",
            }}
          >
            Close
          </button>
          <button
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "none",
              background: "#6366f1",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Open Full Canvas ↗
          </button>
        </div>
      </div>
    </div>
  )
}
