"use client"

import { useState } from "react"

type Member = {
  id: string
  name: string
  role: "Organizer" | "Lead" | "Volunteer"
  availability: "free" | "busy" | "overloaded"
  tasksCount: number
}

const MOCK_MEMBERS: Member[] = [
  { id: "1", name: "Priya Sharma", role: "Organizer", availability: "free", tasksCount: 3 },
  { id: "2", name: "Rahul Mehta", role: "Lead", availability: "busy", tasksCount: 7 },
  { id: "3", name: "Ananya Singh", role: "Volunteer", availability: "free", tasksCount: 2 },
  { id: "4", name: "Dev Kumar", role: "Volunteer", availability: "overloaded", tasksCount: 11 },
  { id: "5", name: "Sneha Patel", role: "Lead", availability: "busy", tasksCount: 5 },
  { id: "6", name: "Arjun Nair", role: "Volunteer", availability: "free", tasksCount: 1 },
]

const AVAILABILITY_COLOR: Record<Member["availability"], string> = {
  free: "#22c55e",
  busy: "#f59e0b",
  overloaded: "#ef4444",
}

const AVAILABILITY_LABEL: Record<Member["availability"], string> = {
  free: "Free",
  busy: "Busy",
  overloaded: "Overloaded",
}

type Tab = "members" | "chat" | "analytics"

const MOCK_MESSAGES = [
  { id: 1, author: "Priya Sharma", text: "Stage setup confirmed for Saturday!", time: "2:30 PM" },
  { id: 2, author: "Rahul Mehta", text: "Sponsorship deck needs review before tonight.", time: "3:15 PM" },
  { id: 3, author: "Ananya Singh", text: "Volunteers briefing is at 9 AM tomorrow.", time: "3:45 PM" },
]

type RightSidebarProps = {
  isOpen: boolean
  onToggle: () => void
}

export function RightSidebar({ isOpen, onToggle }: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>("members")
  const [chatMessage, setChatMessage] = useState("")

  return (
    <>
      {/* Toggle button (always visible) */}
      <button
        onClick={onToggle}
        title={isOpen ? "Close sidebar" : "Open sidebar"}
        style={{
          position: "absolute",
          top: "50%",
          right: isOpen ? "320px" : "0px",
          transform: "translateY(-50%)",
          width: "20px",
          height: "48px",
          background: "#1e293b",
          border: "none",
          borderRadius: "6px 0 0 6px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: "11px",
          transition: "right 0.25s ease",
          zIndex: 20,
          boxShadow: "-2px 0 8px rgba(0,0,0,0.10)",
        }}
      >
        {isOpen ? "›" : "‹"}
      </button>

      {/* Sidebar panel */}
      <div
        style={{
          width: isOpen ? "320px" : "0px",
          height: "100%",
          background: "#f8fafc",
          borderLeft: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "width 0.25s ease",
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {isOpen && (
          <>
            {/* Tab bar */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #e2e8f0",
                background: "#fff",
                flexShrink: 0,
              }}
            >
              {(["members", "chat", "analytics"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: "10px 4px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: activeTab === tab ? 700 : 500,
                    color: activeTab === tab ? "#6366f1" : "#64748b",
                    background: "transparent",
                    borderBottom: activeTab === tab ? "2px solid #6366f1" : "2px solid transparent",
                    textTransform: "capitalize",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab === "members" ? "👥 Team" : tab === "chat" ? "💬 Chat" : "📊 Analytics"}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {activeTab === "members" && <MembersTab members={MOCK_MEMBERS} />}
              {activeTab === "chat" && (
                <ChatTab
                  messages={MOCK_MESSAGES}
                  chatMessage={chatMessage}
                  onMessageChange={setChatMessage}
                />
              )}
              {activeTab === "analytics" && <AnalyticsTab members={MOCK_MEMBERS} />}
            </div>
          </>
        )}
      </div>
    </>
  )
}

function MembersTab({ members }: { members: Member[] }) {
  return (
    <div style={{ padding: "12px" }}>
      <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
        {members.length} members
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {members.map((m) => (
          <div
            key={m.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", JSON.stringify({ type: "person", name: m.name, id: m.id }))
            }}
            style={{
              background: "#fff",
              borderRadius: "10px",
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              border: "1px solid #e2e8f0",
              cursor: "grab",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: `hsl(${(m.name.charCodeAt(0) * 37) % 360}, 60%, 55%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
                position: "relative",
              }}
            >
              {m.name.charAt(0)}
              {/* Availability dot */}
              <span
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: AVAILABILITY_COLOR[m.availability],
                  border: "2px solid #fff",
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {m.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>{m.role}</span>
                <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#cbd5e1" }} />
                <span style={{ fontSize: "10px", color: AVAILABILITY_COLOR[m.availability], fontWeight: 600 }}>
                  {AVAILABILITY_LABEL[m.availability]}
                </span>
              </div>
            </div>

            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: m.tasksCount >= 8 ? "#ef4444" : "#64748b",
                whiteSpace: "nowrap",
              }}
            >
              {m.tasksCount} tasks
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: "10px", color: "#94a3b8", marginTop: "10px", textAlign: "center" }}>
        Drag a member onto the canvas to place them
      </p>
    </div>
  )
}

function ChatTab({
  messages,
  chatMessage,
  onMessageChange,
}: {
  messages: typeof MOCK_MESSAGES
  chatMessage: string
  onMessageChange: (v: string) => void
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ background: "#fff", borderRadius: "10px", padding: "10px 12px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>{msg.author}</span>
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>{msg.time}</span>
            </div>
            <p style={{ fontSize: "12px", color: "#475569", margin: 0, lineHeight: "1.5" }}>{msg.text}</p>
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 12px", borderTop: "1px solid #e2e8f0", background: "#fff", display: "flex", gap: "8px" }}>
        <input
          value={chatMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "8px 10px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            fontSize: "12px",
            outline: "none",
            color: "#1e293b",
          }}
        />
        <button
          onClick={() => onMessageChange("")}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "none",
            background: "#6366f1",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}

function AnalyticsTab({ members }: { members: Member[] }) {
  const totalTasks = members.reduce((s, m) => s + m.tasksCount, 0)
  const doneTasks = Math.round(totalTasks * 0.38)
  const completionPct = Math.round((doneTasks / totalTasks) * 100)
  const topContributors = [...members].sort((a, b) => b.tasksCount - a.tasksCount).slice(0, 3)
  const bottleneck = members.find((m) => m.availability === "overloaded")

  return (
    <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* Completion */}
      <div style={{ background: "#fff", borderRadius: "10px", padding: "12px", border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
          Overall Progress
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "8px" }}>
          <span style={{ fontSize: "28px", fontWeight: 800, color: "#1e293b" }}>{completionPct}%</span>
          <span style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>{doneTasks} / {totalTasks} tasks done</span>
        </div>
        <div style={{ background: "#f1f5f9", borderRadius: "999px", height: "8px", overflow: "hidden" }}>
          <div
            style={{
              width: `${completionPct}%`,
              height: "100%",
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
              borderRadius: "999px",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Top contributors */}
      <div style={{ background: "#fff", borderRadius: "10px", padding: "12px", border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
          Top Contributors
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {topContributors.map((m, i) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: ["#f59e0b", "#94a3b8", "#cd7c3a"][i], width: "16px" }}>
                {["🥇", "🥈", "🥉"][i]}
              </span>
              <span style={{ fontSize: "12px", color: "#1e293b", flex: 1 }}>{m.name}</span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#6366f1" }}>{m.tasksCount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottleneck */}
      {bottleneck && (
        <div style={{ background: "#fef2f2", borderRadius: "10px", padding: "12px", border: "1px solid #fecaca" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
            ⚠ Bottleneck Detected
          </div>
          <p style={{ fontSize: "12px", color: "#7f1d1d", margin: 0, lineHeight: "1.5" }}>
            <strong>{bottleneck.name}</strong> is overloaded with {bottleneck.tasksCount} tasks. Consider reassigning some to free members.
          </p>
        </div>
      )}

      {/* Workload distribution */}
      <div style={{ background: "#fff", borderRadius: "10px", padding: "12px", border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
          Workload Distribution
        </div>
        {members.map((m) => {
          const pct = totalTasks ? Math.round((m.tasksCount / totalTasks) * 100) : 0
          return (
            <div key={m.id} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                <span style={{ fontSize: "11px", color: "#475569" }}>{m.name.split(" ")[0]}</span>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#1e293b" }}>{m.tasksCount}</span>
              </div>
              <div style={{ background: "#f1f5f9", borderRadius: "999px", height: "5px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: AVAILABILITY_COLOR[m.availability],
                    borderRadius: "999px",
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
