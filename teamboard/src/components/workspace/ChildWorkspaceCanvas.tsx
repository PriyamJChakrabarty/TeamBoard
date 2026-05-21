"use client"

import { useMemo } from "react"
import { Tldraw, TLComponents, TLUiOverrides } from "tldraw"
import "tldraw/tldraw.css"
import { useRouter } from "next/navigation"
import { TaskCardShapeUtil, TaskCardTool } from "../shapes/TaskCardShape"
import { AnnouncementCardShapeUtil, AnnouncementCardTool } from "../shapes/AnnouncementCardShape"
import { LeftToolbar } from "./LeftToolbar"
import { ConnectionLayer } from "./ConnectionLayer"
import { CanvasSeedLayer } from "./CanvasSeedLayer"
import { TaskDetailModal } from "./TaskDetailModal"
import { AnnouncementsDialog, AnnouncementsOpenDetail } from "./AnnouncementsDialog"
import { useState, useEffect } from "react"

const CUSTOM_SHAPE_UTILS = [TaskCardShapeUtil, AnnouncementCardShapeUtil]
const CUSTOM_TOOLS = [TaskCardTool, AnnouncementCardTool]

const UI_OVERRIDES: TLUiOverrides = {
  tools(editor, tools) {
    tools["task-card"] = {
      id: "task-card",
      icon: "color",
      label: "Task Card",
      kbd: "t",
      onSelect: () => editor.setCurrentTool("task-card"),
    }
    tools["announcement-card"] = {
      id: "announcement-card",
      icon: "color",
      label: "Announcement Card",
      kbd: "a",
      onSelect: () => editor.setCurrentTool("announcement-card"),
    }
    return tools
  },
}

const BASE_COMPONENTS: Omit<TLComponents, "InFrontOfTheCanvas"> = {
  Toolbar: LeftToolbar,
  StylePanel: null,
  NavigationPanel: null,
  PageMenu: null,
  HelperButtons: null,
  DebugMenu: null,
  MenuPanel: null,
  SharePanel: null,
  TopPanel: null,
}

type TaskDetailInfo = { shapeId: string; title: string } | null

export function ChildWorkspaceCanvas({
  eventId,
  cardId,
}: {
  eventId: string
  cardId: string
}) {
  const router = useRouter()
  const [taskDetail, setTaskDetail] = useState<TaskDetailInfo>(null)
  const [announcementsInfo, setAnnouncementsInfo] = useState<AnnouncementsOpenDetail | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ shapeId: string; title: string }>
      setTaskDetail({ shapeId: ce.detail.shapeId, title: ce.detail.title })
    }
    document.addEventListener("task-card:enter", handler)
    return () => document.removeEventListener("task-card:enter", handler)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<AnnouncementsOpenDetail>
      setAnnouncementsInfo(ce.detail)
    }
    document.addEventListener("announcements:open", handler)
    return () => document.removeEventListener("announcements:open", handler)
  }, [])

  // Build a stable InFrontOfTheCanvas component scoped to this cardId
  const components = useMemo<TLComponents>(() => {
    function InFront() {
      return (
        <>
          <ConnectionLayer />
          <CanvasSeedLayer cardId={cardId} />
        </>
      )
    }
    return { ...BASE_COMPONENTS, InFrontOfTheCanvas: InFront }
  }, [cardId])

  const overrides = useMemo(() => UI_OVERRIDES, [])

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Back bar */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 68,
          zIndex: 400,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#1e293b",
          borderRadius: 10,
          padding: "5px 12px 5px 8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          pointerEvents: "all",
        }}
      >
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => router.push(`/events/${eventId}`)}
          style={{
            background: "none",
            border: "none",
            color: "#e2e8f0",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontFamily: "system-ui, sans-serif",
            padding: 0,
          }}
        >
          ← Event Canvas
        </button>
        <span style={{ color: "#475569", fontSize: 12 }}>/</span>
        <span style={{ color: "#94a3b8", fontSize: 11, fontFamily: "system-ui, sans-serif" }}>
          Card Canvas
        </span>
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <Tldraw
          persistenceKey={`card-canvas-${cardId}`}
          shapeUtils={CUSTOM_SHAPE_UTILS}
          tools={CUSTOM_TOOLS}
          overrides={overrides}
          components={components}
        />
      </div>

      {taskDetail && (
        <TaskDetailModal
          shapeId={taskDetail.shapeId}
          title={taskDetail.title}
          onClose={() => setTaskDetail(null)}
        />
      )}

      {announcementsInfo && (
        <AnnouncementsDialog
          taskTitle={announcementsInfo.taskTitle}
          announcements={announcementsInfo.announcements}
          onClose={() => setAnnouncementsInfo(null)}
        />
      )}
    </div>
  )
}
