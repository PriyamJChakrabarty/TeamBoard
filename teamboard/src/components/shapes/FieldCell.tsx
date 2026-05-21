"use client"

import { useState } from "react"

// ─── Field type catalogue ─────────────────────────────────────────────────────

export type FieldType =
  | "short-text" | "long-text" | "number" | "decimal" | "currency"
  | "date" | "datetime" | "time-range" | "duration"
  | "checkbox" | "single-select" | "multi-select"
  | "priority" | "status" | "progress" | "labels"
  | "url" | "color" | "rating"
  | "location" | "dependency" | "checklist"

export type FieldTypeDef = {
  type: FieldType
  label: string
  icon: string
  desc: string
  group: string
  hasOptions?: boolean
}

export const FIELD_TYPE_DEFS: FieldTypeDef[] = [
  // Text & Numbers
  { type: "short-text",    label: "Short Text",    icon: "Aa",  desc: "Single line — e.g. Vendor Name",      group: "Text & Numbers" },
  { type: "long-text",     label: "Long Text",      icon: "¶",   desc: "Multi-line — e.g. Task Notes",        group: "Text & Numbers" },
  { type: "number",        label: "Number",         icon: "#",   desc: "Whole number — e.g. Volunteers: 12",  group: "Text & Numbers" },
  { type: "decimal",       label: "Decimal",        icon: ".#",  desc: "Decimals — e.g. Budget: ₹4500.50",    group: "Text & Numbers" },
  { type: "currency",      label: "Currency",       icon: "₹$",  desc: "Money field with ₹ / $ symbol",       group: "Text & Numbers" },
  // Date & Time
  { type: "date",          label: "Date",           icon: "📅",  desc: "Only date — e.g. Due Date",           group: "Date & Time" },
  { type: "datetime",      label: "Date & Time",    icon: "🕐",  desc: "Date + time — e.g. Event Start",      group: "Date & Time" },
  { type: "time-range",    label: "Time Range",     icon: "↔",   desc: "Start → End time — e.g. Session",     group: "Date & Time" },
  { type: "duration",      label: "Duration",       icon: "⏱",   desc: "e.g. 2 hours 30 mins",                group: "Date & Time" },
  // Selection
  { type: "checkbox",      label: "Checkbox",       icon: "☑",   desc: "Yes / No — e.g. Approved?",           group: "Selection" },
  { type: "single-select", label: "Single Select",  icon: "▾",   desc: "Choose one — e.g. Status, Category",  group: "Selection", hasOptions: true },
  { type: "multi-select",  label: "Multi Select",   icon: "⊞",   desc: "Choose many — e.g. Tags",             group: "Selection", hasOptions: true },
  // Organisation
  { type: "priority",      label: "Priority",       icon: "⚡",  desc: "High / Medium / Low with colour",     group: "Organisation" },
  { type: "status",        label: "Status",         icon: "◎",   desc: "Custom workflow states",               group: "Organisation", hasOptions: true },
  { type: "progress",      label: "Progress",       icon: "▓",   desc: "Percentage slider 0–100%",             group: "Organisation" },
  { type: "labels",        label: "Labels / Tags",  icon: "🏷",  desc: "Coloured tags — quick visual filter",  group: "Organisation", hasOptions: true },
  // Links & Visual
  { type: "url",           label: "URL",            icon: "🔗",  desc: "Link — e.g. Drive folder, Tickets",   group: "Links & Visual" },
  { type: "color",         label: "Color",          icon: "🎨",  desc: "Color picker — e.g. Visual theme",    group: "Links & Visual" },
  { type: "rating",        label: "Rating",         icon: "★",   desc: "1–5 stars — e.g. Vendor feedback",    group: "Links & Visual" },
  // Event-specific
  { type: "location",      label: "Location",       icon: "📍",  desc: "Venue / Room / Stall number",         group: "Event" },
  { type: "dependency",    label: "Dependency",     icon: "⛓",   desc: "Blocks / Blocked by another task",    group: "Event" },
  { type: "checklist",     label: "Checklist",      icon: "☑️",  desc: "Sub-tasks checklist inside card",     group: "Event" },
]

// ─── Default value JSON per type ─────────────────────────────────────────────

export function defaultValueJson(type: FieldType): string {
  switch (type) {
    case "short-text":
    case "long-text":
    case "url":
    case "location":
    case "date":
    case "datetime":      return '""'
    case "number":
    case "decimal":       return "null"
    case "currency":      return '{"symbol":"₹","value":null}'
    case "time-range":    return '{"start":"","end":""}'
    case "duration":      return '{"hours":0,"minutes":0}'
    case "checkbox":      return "false"
    case "single-select": return '{"options":[],"value":""}'
    case "multi-select":  return '{"options":[],"value":[]}'
    case "priority":      return '"medium"'
    case "status":        return '{"options":["To Do","In Progress","Review","Done","Blocked"],"value":"To Do"}'
    case "progress":      return "0"
    case "labels":        return '{"options":[],"value":[]}'
    case "dependency":    return '{"taskTitle":"","relation":"blocks"}'
    case "rating":        return "0"
    case "color":         return '"#6366f1"'
    case "checklist":     return "[]"
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function parseVal(json: string): unknown {
  try { return JSON.parse(json) } catch { return json }
}

const PRIORITY_COLOR: Record<string, string> = {
  high: "#ef4444", medium: "#f59e0b", low: "#94a3b8",
}

const STATUS_COLOR_MAP: Record<string, string> = {
  "To Do": "#6366f1", "In Progress": "#f59e0b",
  "Review": "#8b5cf6", "Done": "#22c55e", "Blocked": "#ef4444",
}

const PALETTE = ["#6366f1", "#ec4899", "#14b8a6", "#f97316", "#84cc16", "#a855f7"]

const inp: React.CSSProperties = {
  fontSize: 11, padding: "3px 6px", borderRadius: 5,
  border: "1px solid #e2e8f0", outline: "none",
  color: "#1e293b", background: "#fff",
  fontFamily: "system-ui, sans-serif",
}

// ─── FieldCell ────────────────────────────────────────────────────────────────

type FieldCellProps = {
  fieldType: string
  valueJson: string
  onChange: (newJson: string) => void
}

export function FieldCell({ fieldType, valueJson, onChange }: FieldCellProps) {
  const val = parseVal(valueJson)
  const upd = (v: unknown) => onChange(JSON.stringify(v))

  switch (fieldType as FieldType) {

    case "short-text":
    case "location":
      return (
        <input
          value={(val as string) ?? ""}
          onChange={e => upd(e.target.value)}
          onPointerDown={e => e.stopPropagation()}
          placeholder="—"
          style={{ ...inp, flex: 1, minWidth: 0, width: "100%" }}
        />
      )

    case "long-text":
      return (
        <textarea
          value={(val as string) ?? ""}
          onChange={e => upd(e.target.value)}
          onPointerDown={e => e.stopPropagation()}
          rows={2}
          placeholder="—"
          style={{ ...inp, flex: 1, resize: "vertical", minWidth: 0, width: "100%" }}
        />
      )

    case "number":
      return (
        <input
          type="number" step="1"
          value={val === null ? "" : String(val)}
          onChange={e => upd(e.target.value === "" ? null : parseInt(e.target.value))}
          onPointerDown={e => e.stopPropagation()}
          placeholder="0"
          style={{ ...inp, width: 80 }}
        />
      )

    case "decimal":
      return (
        <input
          type="number" step="0.01"
          value={val === null ? "" : String(val)}
          onChange={e => upd(e.target.value === "" ? null : parseFloat(e.target.value))}
          onPointerDown={e => e.stopPropagation()}
          placeholder="0.00"
          style={{ ...inp, width: 90 }}
        />
      )

    case "currency": {
      const cv = val as { symbol: string; value: number | null }
      return (
        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
          <select
            value={cv?.symbol ?? "₹"}
            onChange={e => upd({ ...(cv ?? {}), symbol: e.target.value })}
            onPointerDown={e => e.stopPropagation()}
            style={{ ...inp, width: 40 }}
          >
            <option>₹</option>
            <option>$</option>
            <option>€</option>
          </select>
          <input
            type="number" step="0.01"
            value={cv?.value === null || cv?.value === undefined ? "" : String(cv.value)}
            onChange={e => upd({ ...(cv ?? {}), value: e.target.value === "" ? null : parseFloat(e.target.value) })}
            onPointerDown={e => e.stopPropagation()}
            placeholder="0.00"
            style={{ ...inp, flex: 1, minWidth: 0 }}
          />
        </div>
      )
    }

    case "date":
      return (
        <input
          type="date"
          value={(val as string) ?? ""}
          onChange={e => upd(e.target.value)}
          onPointerDown={e => e.stopPropagation()}
          style={{ ...inp, flex: 1 }}
        />
      )

    case "datetime":
      return (
        <input
          type="datetime-local"
          value={(val as string) ?? ""}
          onChange={e => upd(e.target.value)}
          onPointerDown={e => e.stopPropagation()}
          style={{ ...inp, flex: 1 }}
        />
      )

    case "time-range": {
      const tr = (val as { start: string; end: string }) ?? { start: "", end: "" }
      return (
        <div style={{ display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap" }}>
          <input type="time" value={tr.start}
            onChange={e => upd({ ...tr, start: e.target.value })}
            onPointerDown={e => e.stopPropagation()}
            style={{ ...inp, width: 80 }} />
          <span style={{ fontSize: 10, color: "#94a3b8" }}>→</span>
          <input type="time" value={tr.end}
            onChange={e => upd({ ...tr, end: e.target.value })}
            onPointerDown={e => e.stopPropagation()}
            style={{ ...inp, width: 80 }} />
        </div>
      )
    }

    case "duration": {
      const dur = (val as { hours: number; minutes: number }) ?? { hours: 0, minutes: 0 }
      return (
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <input type="number" min="0" step="1" value={dur.hours}
            onChange={e => upd({ ...dur, hours: Math.max(0, parseInt(e.target.value) || 0) })}
            onPointerDown={e => e.stopPropagation()}
            style={{ ...inp, width: 48 }} />
          <span style={{ fontSize: 10, color: "#64748b" }}>h</span>
          <input type="number" min="0" max="59" step="1" value={dur.minutes}
            onChange={e => upd({ ...dur, minutes: Math.min(59, Math.max(0, parseInt(e.target.value) || 0)) })}
            onPointerDown={e => e.stopPropagation()}
            style={{ ...inp, width: 48 }} />
          <span style={{ fontSize: 10, color: "#64748b" }}>m</span>
        </div>
      )
    }

    case "checkbox":
      return (
        <div
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); upd(!val) }}
          style={{
            width: 20, height: 20, borderRadius: 5, flexShrink: 0,
            border: `2px solid ${val ? "#22c55e" : "#cbd5e1"}`,
            background: val ? "#22c55e" : "transparent",
            cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
        >
          {!!val && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, lineHeight: 1 }}>✓</span>}
        </div>
      )

    case "single-select": {
      const ss = (val as { options: string[]; value: string }) ?? { options: [], value: "" }
      return (
        <select
          value={ss.value}
          onChange={e => upd({ ...ss, value: e.target.value })}
          onPointerDown={e => e.stopPropagation()}
          style={{ ...inp, flex: 1 }}
        >
          <option value="">— select —</option>
          {ss.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    }

    case "multi-select": {
      const ms = (val as { options: string[]; value: string[] }) ?? { options: [], value: [] }
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {ms.options.map((o, i) => {
            const on = ms.value.includes(o)
            return (
              <button key={o}
                onPointerDown={e => e.stopPropagation()}
                onClick={e => {
                  e.stopPropagation()
                  upd({ ...ms, value: on ? ms.value.filter(v => v !== o) : [...ms.value, o] })
                }}
                style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 999, cursor: "pointer",
                  border: `1px solid ${PALETTE[i % PALETTE.length]}55`,
                  background: on ? PALETTE[i % PALETTE.length] + "33" : "transparent",
                  color: on ? PALETTE[i % PALETTE.length] : "#64748b",
                  fontWeight: on ? 700 : 400,
                }}
              >{o}</button>
            )
          })}
        </div>
      )
    }

    case "url":
      return (
        <div style={{ display: "flex", gap: 3, alignItems: "center", flex: 1, minWidth: 0 }}>
          <input
            type="url"
            value={(val as string) ?? ""}
            onChange={e => upd(e.target.value)}
            onPointerDown={e => e.stopPropagation()}
            placeholder="https://..."
            style={{ ...inp, flex: 1, minWidth: 0 }}
          />
          {(val as string) && (
            <a href={val as string} target="_blank" rel="noopener noreferrer"
              onPointerDown={e => e.stopPropagation()}
              style={{ fontSize: 12, color: "#6366f1" }}>↗</a>
          )}
        </div>
      )

    case "priority": {
      const pv = (val as string) || "medium"
      return (
        <div style={{ display: "flex", gap: 3 }} onPointerDown={e => e.stopPropagation()}>
          {(["high", "medium", "low"] as const).map(p => (
            <button key={p}
              onClick={e => { e.stopPropagation(); upd(p) }}
              style={{
                fontSize: 10, padding: "2px 8px", borderRadius: 999,
                cursor: "pointer", border: "none",
                background: pv === p ? PRIORITY_COLOR[p] : PRIORITY_COLOR[p] + "22",
                color: pv === p ? "#fff" : PRIORITY_COLOR[p],
                fontWeight: pv === p ? 700 : 400,
                textTransform: "capitalize",
              }}
            >{p}</button>
          ))}
        </div>
      )
    }

    case "status": {
      const sv = (val as { options: string[]; value: string }) ?? { options: ["To Do", "In Progress", "Done"], value: "To Do" }
      const col = STATUS_COLOR_MAP[sv.value] ?? "#94a3b8"
      return (
        <select
          value={sv.value}
          onChange={e => upd({ ...sv, value: e.target.value })}
          onPointerDown={e => e.stopPropagation()}
          style={{ ...inp, flex: 1, color: col, fontWeight: 600 }}
        >
          {sv.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    }

    case "progress": {
      const pct = (val as number) ?? 0
      return (
        <div style={{ display: "flex", gap: 6, alignItems: "center", flex: 1 }}>
          <input
            type="range" min="0" max="100" step="1"
            value={pct}
            onChange={e => upd(parseInt(e.target.value))}
            onPointerDown={e => e.stopPropagation()}
            style={{ flex: 1, accentColor: "#6366f1", cursor: "pointer" }}
          />
          <span style={{ fontSize: 11, color: "#6366f1", width: 34, textAlign: "right", fontWeight: 700 }}>
            {pct}%
          </span>
        </div>
      )
    }

    case "labels": {
      const lv = (val as { options: string[]; value: string[] }) ?? { options: [], value: [] }
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {lv.options.map((o, i) => {
            const on = lv.value.includes(o)
            const c = PALETTE[i % PALETTE.length]
            return (
              <button key={o}
                onPointerDown={e => e.stopPropagation()}
                onClick={e => {
                  e.stopPropagation()
                  upd({ ...lv, value: on ? lv.value.filter(v => v !== o) : [...lv.value, o] })
                }}
                style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 999, cursor: "pointer",
                  border: `1px solid ${c}55`,
                  background: on ? c + "33" : "transparent",
                  color: on ? c : "#64748b",
                  fontWeight: on ? 700 : 400,
                }}
              >{o}</button>
            )
          })}
        </div>
      )
    }

    case "dependency": {
      const dv = (val as { taskTitle: string; relation: string }) ?? { taskTitle: "", relation: "blocks" }
      return (
        <div style={{ display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap" }}>
          <select
            value={dv.relation}
            onChange={e => upd({ ...dv, relation: e.target.value })}
            onPointerDown={e => e.stopPropagation()}
            style={{ ...inp, width: 84 }}
          >
            <option value="blocks">blocks</option>
            <option value="blocked-by">blocked by</option>
          </select>
          <input
            value={dv.taskTitle}
            onChange={e => upd({ ...dv, taskTitle: e.target.value })}
            onPointerDown={e => e.stopPropagation()}
            placeholder="Task name..."
            style={{ ...inp, flex: 1, minWidth: 0 }}
          />
        </div>
      )
    }

    case "rating": {
      const rv = (val as number) ?? 0
      return (
        <div style={{ display: "flex", gap: 1 }} onPointerDown={e => e.stopPropagation()}>
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star}
              onClick={e => { e.stopPropagation(); upd(star === rv ? 0 : star) }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 18, color: star <= rv ? "#f59e0b" : "#e2e8f0",
                padding: 0, lineHeight: 1,
              }}
            >★</button>
          ))}
        </div>
      )
    }

    case "color":
      return (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }} onPointerDown={e => e.stopPropagation()}>
          <input
            type="color"
            value={(val as string) || "#6366f1"}
            onChange={e => upd(e.target.value)}
            style={{ width: 30, height: 26, padding: 2, border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer" }}
          />
          <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>
            {(val as string) || "#6366f1"}
          </span>
        </div>
      )

    case "checklist": {
      const cl = (val as { label: string; done: boolean }[]) ?? []
      const doneCount = cl.filter(i => i.done).length
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
          {cl.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 999, height: 4, overflow: "hidden" }}>
                <div style={{
                  width: `${cl.length ? (doneCount / cl.length) * 100 : 0}%`,
                  height: "100%", background: "#22c55e", borderRadius: 999,
                }} />
              </div>
              <span style={{ fontSize: 10, color: "#64748b", flexShrink: 0 }}>
                {doneCount}/{cl.length}
              </span>
            </div>
          )}
          {cl.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div
                onPointerDown={e => e.stopPropagation()}
                onClick={e => {
                  e.stopPropagation()
                  upd(cl.map((it, j) => j === i ? { ...it, done: !it.done } : it))
                }}
                style={{
                  width: 15, height: 15, borderRadius: 3, flexShrink: 0,
                  border: `2px solid ${item.done ? "#22c55e" : "#cbd5e1"}`,
                  background: item.done ? "#22c55e" : "transparent",
                  cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                {item.done && <span style={{ color: "#fff", fontSize: 9, fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{
                fontSize: 11, flex: 1,
                color: item.done ? "#94a3b8" : "#1e293b",
                textDecoration: item.done ? "line-through" : "none",
              }}>
                {item.label}
              </span>
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); upd(cl.filter((_, j) => j !== i)) }}
                style={{ background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: 11, padding: 0, lineHeight: 1 }}
              >×</button>
            </div>
          ))}
          <ChecklistAddItem onAdd={label => upd([...cl, { label, done: false }])} />
        </div>
      )
    }

    default:
      return <span style={{ fontSize: 11, color: "#94a3b8" }}>—</span>
  }
}

// ─── Checklist add-item sub-component ────────────────────────────────────────

function ChecklistAddItem({ onAdd }: { onAdd: (label: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState("")
  const commit = () => { if (text.trim()) { onAdd(text.trim()); setText("") } }

  if (!editing) return (
    <button
      onPointerDown={e => e.stopPropagation()}
      onClick={e => { e.stopPropagation(); setEditing(true) }}
      style={{
        fontSize: 10, fontWeight: 600, color: "#94a3b8",
        background: "none", border: "1px dashed #e2e8f0",
        borderRadius: 5, padding: "2px 7px", cursor: "pointer",
        fontFamily: "system-ui, sans-serif",
      }}
    >+ item</button>
  )

  return (
    <div style={{ display: "flex", gap: 3 }} onPointerDown={e => e.stopPropagation()}>
      <input
        autoFocus value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false) }}
        placeholder="Sub-task..."
        style={{
          fontSize: 11, padding: "3px 6px", borderRadius: 5,
          border: "1px solid #e2e8f0", outline: "none",
          flex: 1, fontFamily: "system-ui, sans-serif",
        }}
      />
      <button onClick={e => { e.stopPropagation(); commit() }}
        style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, border: "none", background: "#22c55e22", color: "#22c55e", cursor: "pointer" }}>✓</button>
      <button onClick={e => { e.stopPropagation(); setEditing(false) }}
        style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, border: "none", background: "#f1f5f9", color: "#94a3b8", cursor: "pointer" }}>×</button>
    </div>
  )
}
