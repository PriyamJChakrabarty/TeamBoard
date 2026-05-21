"use client"

import { useEditor, useTools, useValue } from "tldraw"

const TOOL_ORDER = [
  "select",
  "task-card",
  "announcement-card",
  "text",
  "note",
  "arrow",
  "geo",
  "draw",
  "eraser",
]

const TOOL_ICONS: Record<string, string> = {
  select: "↖",
  "task-card": "📋",
  "announcement-card": "🎙️",
  text: "T",
  note: "📝",
  arrow: "→",
  geo: "▭",
  draw: "✏️",
  eraser: "⌫",
}

export function LeftToolbar() {
  const editor = useEditor()
  const tools = useTools()
  const currentToolId = useValue("current tool", () => editor.getCurrentToolId(), [editor])

  const orderedTools = TOOL_ORDER
    .map((id) => tools[id])
    .filter(Boolean)

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        width: "56px",
        background: "#1e293b",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "12px",
        paddingBottom: "12px",
        gap: "2px",
        zIndex: 300,
        boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
        pointerEvents: "all",
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          fontWeight: 800,
          color: "#fff",
          marginBottom: "12px",
          flexShrink: 0,
        }}
      >
        E
      </div>

      <div style={{ width: "80%", height: "1px", background: "#334155", marginBottom: "8px" }} />

      {orderedTools.map((tool) => {
        const isActive = currentToolId === tool.id
        const icon = TOOL_ICONS[tool.id] ?? "○"
        return (
          <button
            key={tool.id}
            title={`${tool.label} ${tool.kbd ? `(${tool.kbd})` : ""}`}
            onPointerDown={(e) => {
              e.preventDefault()
              editor.setCurrentTool(tool.id)
            }}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              background: isActive ? "#6366f1" : "transparent",
              color: isActive ? "#fff" : "#94a3b8",
              transition: "all 0.15s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "#334155"
                e.currentTarget.style.color = "#e2e8f0"
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.color = "#94a3b8"
              }
            }}
          >
            {icon}
          </button>
        )
      })}
    </div>
  )
}
