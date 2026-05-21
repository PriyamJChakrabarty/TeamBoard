"use client"

import { useEditor } from "tldraw"
import type { TLAnnouncementCardShape, AnnouncementCardProps } from "./AnnouncementCardShape"
import { ConnectionDots } from "./ConnectionDots"

export function AnnouncementCardComponent({ shape }: { shape: TLAnnouncementCardShape }) {
  const editor = useEditor()
  const { props } = shape

  function update(patch: Partial<AnnouncementCardProps>) {
    editor.updateShape<TLAnnouncementCardShape>({
      id: shape.id,
      type: "announcement-card",
      props: patch,
    })
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <ConnectionDots shapeId={shape.id} />

      {/* Card */}
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #f97316 0%, #db2777 100%)",
          borderRadius: 12,
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, sans-serif",
          userSelect: "none",
          overflow: "hidden",
          boxShadow: "0 4px 28px rgba(219,39,119,0.35), 0 2px 8px rgba(249,115,22,0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "10px 14px 8px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(0,0,0,0.08)",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>🎙️</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 8,
                fontWeight: 800,
                color: "rgba(255,255,255,0.75)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 3,
              }}
            >
              Announcement
            </div>
            <input
              value={props.title}
              onChange={(e) => update({ title: e.target.value })}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              placeholder="Announcement title..."
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 13,
                width: "100%",
                fontFamily: "system-ui, sans-serif",
                padding: 0,
                caretColor: "#fff",
              }}
            />
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: "10px 14px", overflow: "hidden" }}>
          <textarea
            value={props.body}
            onChange={(e) => update({ body: e.target.value })}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            placeholder="Write your announcement here..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "rgba(255,255,255,0.92)",
              fontSize: 12,
              width: "100%",
              height: "100%",
              resize: "none",
              fontFamily: "system-ui, sans-serif",
              lineHeight: 1.55,
              padding: 0,
              caretColor: "#fff",
            }}
          />
        </div>
      </div>
    </div>
  )
}
