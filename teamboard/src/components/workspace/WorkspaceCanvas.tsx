"use client"

import { useEffect, useMemo, useState } from "react"
import { Tldraw, TLComponents, TLUiOverrides } from "tldraw"
import "tldraw/tldraw.css"
import { TaskCardShapeUtil, TaskCardTool } from "../shapes/TaskCardShape"
import { AnnouncementCardShapeUtil, AnnouncementCardTool } from "../shapes/AnnouncementCardShape"
import { LeftToolbar } from "./LeftToolbar"
import { BottomBar } from "./BottomBar"
import { RightSidebar } from "./RightSidebar"
import { TaskDetailModal } from "./TaskDetailModal"
import { ConnectionLayer } from "./ConnectionLayer"
import { AnnouncementsDialog, AnnouncementsOpenDetail } from "./AnnouncementsDialog"

const CUSTOM_SHAPE_UTILS = [TaskCardShapeUtil, AnnouncementCardShapeUtil]
const CUSTOM_TOOLS = [TaskCardTool, AnnouncementCardTool]

// Register task-card in the UI's tool map so useTools() returns it
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

// Replace tldraw's toolbar slot with our custom left toolbar
// null-out every other panel we don't need
const COMPONENTS: TLComponents = {
  Toolbar: LeftToolbar,
  InFrontOfTheCanvas: ConnectionLayer,
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

export function WorkspaceCanvas({ eventId }: { eventId: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [taskDetail, setTaskDetail] = useState<TaskDetailInfo>(null)
  const [announcementsInfo, setAnnouncementsInfo] = useState<AnnouncementsOpenDetail | null>(null)

  // Stable refs – must be defined outside render per tldraw docs
  const components = useMemo(() => COMPONENTS, [])
  const overrides = useMemo(() => UI_OVERRIDES, [])

  // Listen for "Enter this world" events dispatched by TaskCard buttons
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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Canvas row: tldraw fills flex-1, sidebar sits to the right */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Tldraw
            persistenceKey={`event-canvas-${eventId}`}
            shapeUtils={CUSTOM_SHAPE_UTILS}
            tools={CUSTOM_TOOLS}
            overrides={overrides}
            components={components}
          />
        </div>

        <div style={{ position: "relative", display: "flex" }}>
          <RightSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />
        </div>
      </div>

      <BottomBar />

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
