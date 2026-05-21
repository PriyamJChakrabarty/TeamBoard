"use client"

import { useState } from "react"

type FilterOption = { id: string; label: string }
type ViewOption = { id: string; label: string; icon: string }

const FILTERS: FilterOption[] = [
  { id: "all", label: "All Tasks" },
  { id: "my", label: "My Tasks" },
  { id: "unassigned", label: "Unassigned" },
  { id: "blocked", label: "Blocked" },
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
]

const VIEWS: ViewOption[] = [
  { id: "canvas", label: "Canvas", icon: "⬡" },
  { id: "kanban", label: "Kanban", icon: "⊞" },
  { id: "timeline", label: "Timeline", icon: "━" },
  { id: "list", label: "List", icon: "≡" },
  { id: "people", label: "People", icon: "⚇" },
]

type BottomBarProps = {
  onViewChange?: (view: string) => void
}

export function BottomBar({ onViewChange }: BottomBarProps) {
  const [activeFilter, setActiveFilter] = useState("all")
  const [activeView, setActiveView] = useState("canvas")

  const handleViewChange = (viewId: string) => {
    setActiveView(viewId)
    onViewChange?.(viewId)
  }

  return (
    <div
      style={{
        height: "44px",
        background: "#1e293b",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        zIndex: 10,
        borderTop: "1px solid #334155",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.15)",
        flexShrink: 0,
      }}
    >
      {/* Filters */}
      <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
        <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 600, marginRight: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Filter
        </span>
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.id
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: isActive ? 600 : 400,
                background: isActive ? "#6366f1" : "transparent",
                color: isActive ? "#fff" : "#94a3b8",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "#334155"
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent"
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div style={{ width: "1px", height: "24px", background: "#334155" }} />

      {/* View toggles */}
      <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
        <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 600, marginRight: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          View
        </span>
        {VIEWS.map((v) => {
          const isActive = activeView === v.id
          const isDisabled = v.id !== "canvas"
          return (
            <button
              key={v.id}
              onClick={() => handleViewChange(v.id)}
              title={isDisabled ? `${v.label} — Coming Soon` : v.label}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                border: "none",
                cursor: isDisabled ? "not-allowed" : "pointer",
                fontSize: "12px",
                fontWeight: isActive ? 600 : 400,
                background: isActive ? "#6366f1" : "transparent",
                color: isActive ? "#fff" : isDisabled ? "#475569" : "#94a3b8",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                opacity: isDisabled ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isActive && !isDisabled) e.currentTarget.style.background = "#334155"
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent"
              }}
            >
              <span style={{ fontSize: "10px" }}>{v.icon}</span>
              {v.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
