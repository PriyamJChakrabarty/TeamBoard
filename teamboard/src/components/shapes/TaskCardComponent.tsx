"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useEditor, TLShapeId } from "tldraw"
import { useRouter, usePathname } from "next/navigation"
import type { TLTaskCardShape, TaskCardProps, StoredField } from "./TaskCardShape"
import type { AnnouncementCardProps } from "./AnnouncementCardShape"
import { ENTRY_KEY } from "../workspace/CanvasSeedLayer"
import type { AnnouncementEntry } from "../workspace/AnnouncementsDialog"
import {
  FieldCell, FIELD_TYPE_DEFS, FieldType,
  defaultValueJson, parseVal,
} from "./FieldCell"
import { ConnectionDots } from "./ConnectionDots"

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAM_MEMBERS = [
  "Priya Sharma", "Rahul Mehta", "Ananya Singh",
  "Dev Kumar", "Sneha Patel", "Arjun Nair",
]

const STATUS_COLOR: Record<TaskCardProps["status"], string> = {
  "todo": "#6366f1", "in-progress": "#f59e0b", "done": "#22c55e",
}
const STATUS_LABEL: Record<TaskCardProps["status"], string> = {
  "todo": "To Do", "in-progress": "In Progress", "done": "Done",
}
const PRIORITY_COLOR: Record<TaskCardProps["priority"], string> = {
  low: "#94a3b8", medium: "#f59e0b", high: "#ef4444",
}
const PALETTE = ["#6366f1", "#ec4899", "#14b8a6", "#f97316", "#84cc16", "#a855f7"]
const SCRIBBLE_COLORS = ["#1e293b", "#6366f1", "#ef4444", "#22c55e", "#f59e0b", "#ec4899"]

const CANVAS_W = 500
const CANVAS_H = 120

// ─── Shared tiny styles ───────────────────────────────────────────────────────

const addBtnStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
  border: "1px dashed #cbd5e1", background: "transparent",
  color: "#94a3b8", cursor: "pointer", fontFamily: "system-ui, sans-serif",
}

const miniInp: React.CSSProperties = {
  fontSize: 11, padding: "3px 6px", borderRadius: 5,
  border: "1px solid #e2e8f0", outline: "none",
  color: "#1e293b", background: "#fff",
  fontFamily: "system-ui, sans-serif",
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Section({ icon, label, children, action }: {
  icon: string; label: string
  children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <div style={{ padding: "7px 12px", borderBottom: "1px solid #f1f5f9" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {icon} {label}
        </span>
        {action}
      </div>
      {children}
    </div>
  )
}

function Chip({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 999,
      background: color + "22", color, border: `1px solid ${color}44`,
    }}>{children}</span>
  )
}

function XBtn({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", cursor: "pointer",
      fontSize: 11, color: "inherit", padding: 0, lineHeight: 1, opacity: 0.6,
    }}>×</button>
  )
}

// ─── Add Field Wizard ─────────────────────────────────────────────────────────

const GROUPS = ["Text & Numbers", "Date & Time", "Selection", "Organisation", "Links & Visual", "Event"]

type AddFieldState =
  | { step: "idle" }
  | { step: "pick-name-type"; name: string; type: FieldType }
  | { step: "add-options"; name: string; type: FieldType; options: string[] }

function AddFieldWizard({ onAdd, onCancel }: {
  onAdd: (field: StoredField) => void
  onCancel: () => void
}) {
  const [name, setName] = useState("")
  const [type, setType] = useState<FieldType>("short-text")
  const [step, setStep] = useState<"type-select" | "options">("type-select")
  const [options, setOptions] = useState<string[]>([])
  const [optInput, setOptInput] = useState("")

  const selectedDef = FIELD_TYPE_DEFS.find(d => d.type === type)!

  const proceed = () => {
    if (!name.trim()) return
    if (selectedDef.hasOptions) {
      // pre-populate sensible defaults
      if (options.length === 0) {
        if (type === "status") setOptions(["To Do", "In Progress", "Review", "Done", "Blocked"])
        else if (type === "single-select" || type === "multi-select") setOptions(["Option 1", "Option 2"])
      }
      setStep("options")
    } else {
      confirm([])
    }
  }

  const confirm = (opts: string[]) => {
    let vj = defaultValueJson(type)
    if (opts.length > 0) {
      const base = parseVal(vj) as Record<string, unknown>
      vj = JSON.stringify({ ...base, options: opts })
    }
    onAdd({ key: name.trim(), fieldType: type, valueJson: vj })
  }

  const addOption = () => {
    const t = optInput.trim()
    if (t && !options.includes(t)) setOptions(p => [...p, t])
    setOptInput("")
  }

  if (step === "options") return (
    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}
      onPointerDown={e => e.stopPropagation()}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>
        {selectedDef.icon} {selectedDef.label} — <span style={{ color: "#6366f1" }}>{name}</span>
      </div>
      <div style={{ fontSize: 10, color: "#64748b" }}>Define the options for this field:</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {options.map((o, i) => (
          <Chip key={o} color={PALETTE[i % PALETTE.length]}>
            {o}
            <XBtn onClick={e => { e.stopPropagation(); setOptions(p => p.filter(x => x !== o)) }} />
          </Chip>
        ))}
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        <input
          autoFocus value={optInput}
          onChange={e => setOptInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") addOption(); if (e.key === "Escape") setStep("type-select") }}
          placeholder="Add option..."
          style={{ ...miniInp, flex: 1 }}
        />
        <button onClick={addOption}
          style={{ ...addBtnStyle, borderStyle: "solid", background: "#6366f133", color: "#6366f1" }}>
          + Add
        </button>
      </div>
      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginTop: 2 }}>
        <button onClick={onCancel} style={addBtnStyle}>Cancel</button>
        <button onClick={() => { setStep("type-select") }}
          style={{ ...addBtnStyle, borderStyle: "solid" }}>← Back</button>
        <button
          disabled={options.length === 0}
          onClick={() => confirm(options)}
          style={{
            fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 6,
            border: "none", background: options.length ? "#6366f1" : "#e2e8f0",
            color: options.length ? "#fff" : "#94a3b8", cursor: options.length ? "pointer" : "not-allowed",
            fontFamily: "system-ui, sans-serif",
          }}>
          Add Field
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}
      onPointerDown={e => e.stopPropagation()}>
      {/* Field name */}
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") proceed(); if (e.key === "Escape") onCancel() }}
        placeholder="Field name (e.g. Budget, Due Date)"
        style={{ ...miniInp, width: "100%" }}
      />

      {/* Type selector grouped */}
      <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>
        Select value type
      </div>
      <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
        {GROUPS.map(group => (
          <div key={group}>
            <div style={{ fontSize: 9, color: "#cbd5e1", fontWeight: 600, padding: "4px 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {group}
            </div>
            {FIELD_TYPE_DEFS.filter(d => d.group === group).map(def => (
              <button
                key={def.type}
                onClick={e => { e.stopPropagation(); setType(def.type) }}
                style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "4px 6px", borderRadius: 6, border: "none", cursor: "pointer",
                  background: type === def.type ? "#6366f122" : "transparent",
                  outline: type === def.type ? "1px solid #6366f144" : "none",
                  textAlign: "left", fontFamily: "system-ui, sans-serif",
                }}
              >
                <span style={{ fontSize: 13, width: 18, textAlign: "center", flexShrink: 0 }}>{def.icon}</span>
                <span style={{ fontSize: 11, fontWeight: type === def.type ? 700 : 500, color: type === def.type ? "#6366f1" : "#1e293b" }}>
                  {def.label}
                </span>
                <span style={{ fontSize: 10, color: "#94a3b8", flex: 1 }}>{def.desc}</span>
                {def.hasOptions && <span style={{ fontSize: 9, color: "#94a3b8", flexShrink: 0 }}>options →</span>}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={addBtnStyle}>Cancel</button>
        <button
          disabled={!name.trim()}
          onClick={proceed}
          style={{
            fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 6,
            border: "none",
            background: name.trim() ? "#6366f1" : "#e2e8f0",
            color: name.trim() ? "#fff" : "#94a3b8",
            cursor: name.trim() ? "pointer" : "not-allowed",
            fontFamily: "system-ui, sans-serif",
          }}>
          {selectedDef.hasOptions ? "Next →" : "Add Field"}
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TaskCardComponent({ shape }: { shape: TLTaskCardShape }) {
  const editor = useEditor()
  const router = useRouter()
  const pathname = usePathname()
  const { props } = shape

  // Extract eventId from path: /events/[eventId] or /events/[eventId]/card/[cardId]
  const eventId = pathname.split("/").filter(Boolean)[1] ?? ""

  // ── UI state ────────────────────────────────────────────────────────────────
  const [showPeopleMenu, setShowPeopleMenu] = useState(false)
  const [showAddField, setShowAddField] = useState(false)
  const [showResForm, setShowResForm] = useState(false)
  const [newResLabel, setNewResLabel] = useState("")
  const [newResUrl, setNewResUrl] = useState("")
  const [scribbleColor, setScribbleColor] = useState(SCRIBBLE_COLORS[0])

  // ── Scribble ─────────────────────────────────────────────────────────────────
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const lastPtRef = useRef<{ x: number; y: number } | null>(null)
  const lastSavedRef = useRef(props.scribbleData)

  useEffect(() => {
    if (props.scribbleData === lastSavedRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
    if (props.scribbleData) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, CANVAS_W, CANVAS_H)
      img.src = props.scribbleData
    }
    lastSavedRef.current = props.scribbleData
  }, [props.scribbleData])

  // ── Updater ──────────────────────────────────────────────────────────────────
  const update = useCallback((patch: Partial<TaskCardProps>) => {
    editor.updateShape<TLTaskCardShape>({ id: shape.id, type: "task-card", props: patch })
  }, [editor, shape.id])

  const updateField = useCallback((idx: number, newJson: string) => {
    const next = props.fields.map((f, i) => i === idx ? { ...f, valueJson: newJson } : f)
    update({ fields: next })
  }, [props.fields, update])

  // ── Scribble handlers ────────────────────────────────────────────────────────
  const onDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.stopPropagation()
    const c = canvasRef.current; if (!c) return
    c.setPointerCapture(e.pointerId)
    isDrawingRef.current = true
    const r = c.getBoundingClientRect()
    lastPtRef.current = {
      x: ((e.clientX - r.left) / r.width) * CANVAS_W,
      y: ((e.clientY - r.top) / r.height) * CANVAS_H,
    }
  }, [])

  const onMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.stopPropagation()
    if (!isDrawingRef.current || !lastPtRef.current) return
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext("2d"); if (!ctx) return
    const r = c.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * CANVAS_W
    const y = ((e.clientY - r.top) / r.height) * CANVAS_H
    ctx.beginPath()
    ctx.strokeStyle = scribbleColor
    ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round"
    ctx.moveTo(lastPtRef.current.x, lastPtRef.current.y)
    ctx.lineTo(x, y)
    ctx.stroke()
    lastPtRef.current = { x, y }
  }, [scribbleColor])

  const onUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.stopPropagation()
    isDrawingRef.current = false; lastPtRef.current = null
    const c = canvasRef.current; if (!c) return
    const data = c.toDataURL("image/png", 0.7)
    lastSavedRef.current = data
    update({ scribbleData: data })
  }, [update])

  const clearScribble = (e: React.MouseEvent) => {
    e.stopPropagation()
    const c = canvasRef.current; if (!c) return
    c.getContext("2d")?.clearRect(0, 0, CANVAS_W, CANVAS_H)
    lastSavedRef.current = ""
    update({ scribbleData: "" })
  }

  // ── Resources ────────────────────────────────────────────────────────────────
  const submitRes = () => {
    const l = newResLabel.trim(); if (!l) return
    update({ resources: [...props.resources, { label: l, url: newResUrl.trim() }] })
    setNewResLabel(""); setNewResUrl(""); setShowResForm(false)
  }

  const sc = STATUS_COLOR[props.status]
  const pc = PRIORITY_COLOR[props.priority]
  const available = TEAM_MEMBERS.filter(m => !props.assignees.includes(m))

  function openAnnouncements() {
    const results: AnnouncementEntry[] = []
    for (const s of editor.getCurrentPageShapes()) {
      if (s.type !== "arrow") continue
      const meta = s.meta as Record<string, string> | undefined
      if (!meta) continue
      let annoId: string | undefined
      if (meta.fromShapeId === shape.id) annoId = meta.toShapeId
      else if (meta.toShapeId === shape.id) annoId = meta.fromShapeId
      if (!annoId) continue
      const anno = editor.getShape(annoId as TLShapeId)
      if (!anno || anno.type !== "announcement-card") continue
      const p = anno.props as AnnouncementCardProps
      results.push({ id: anno.id, title: p.title, body: p.body })
    }
    document.dispatchEvent(
      new CustomEvent("announcements:open", {
        detail: { taskTitle: props.title, announcements: results },
      })
    )
  }

  return (
    <div style={{
      width: "100%", height: "100%", position: "relative",
      // Enclosure border when a canvas exists within this card
      outline: props.hasCanvas ? "3px solid #be185d" : "none",
      outlineOffset: "5px",
      borderRadius: props.hasCanvas ? "15px" : undefined,
    }}>
      <ConnectionDots shapeId={shape.id} />
    <div style={{
      width: "100%", height: "100%",
      background: "#ffffff", borderRadius: 12,
      boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
      border: `2px solid ${sc}`,
      display: "flex", flexDirection: "column",
      fontFamily: "system-ui, sans-serif",
      userSelect: "none", overflow: "hidden",
    }}>
      {/* Accent bar */}
      <div style={{ height: 4, background: sc, flexShrink: 0 }} />

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", flex: 1, lineHeight: 1.3, wordBreak: "break-word" }}>
              {props.title}
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
              background: pc + "22", color: pc, whiteSpace: "nowrap",
              textTransform: "uppercase", letterSpacing: "0.05em",
            }}>
              {props.priority}
            </span>
          </div>
          {props.description && (
            <p style={{ fontSize: 11, color: "#64748b", margin: "5px 0 0", lineHeight: 1.4 }}>
              {props.description}
            </p>
          )}
        </div>

        {/* ── 1. Assigned People ───────────────────────────────────────────── */}
        <Section icon="👥" label="Assigned People">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
            {props.assignees.map(name => (
              <Chip key={name} color="#6366f1">
                {name.split(" ")[0]}
                <XBtn onClick={e => {
                  e.stopPropagation()
                  update({ assignees: props.assignees.filter(a => a !== name) })
                }} />
              </Chip>
            ))}
            {showPeopleMenu ? (
              <div onPointerDown={e => e.stopPropagation()}>
                <select
                  autoFocus
                  size={Math.min(available.length + 1, 5)}
                  onChange={e => {
                    if (e.target.value) {
                      update({ assignees: [...props.assignees, e.target.value] })
                      setShowPeopleMenu(false)
                    }
                  }}
                  onBlur={() => setShowPeopleMenu(false)}
                  style={{
                    fontSize: 11, borderRadius: 6, border: "1px solid #e2e8f0",
                    outline: "none", background: "#fff", cursor: "pointer",
                    padding: "2px 4px", fontFamily: "system-ui, sans-serif",
                  }}
                >
                  <option value="">— select member —</option>
                  {available.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            ) : available.length > 0 && (
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); setShowPeopleMenu(true) }}
                style={addBtnStyle}
              >+ Add</button>
            )}
          </div>
        </Section>

        {/* ── 2. Custom Fields ─────────────────────────────────────────────── */}
        <Section icon="📋" label="Fields">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>

            {props.fields.map((f, i) => {
              const def = FIELD_TYPE_DEFS.find(d => d.type === f.fieldType)
              const isWide = ["long-text", "checklist", "progress", "multi-select", "labels",
                "time-range", "duration", "dependency"].includes(f.fieldType)
              return (
                <div key={i}>
                  {/* Label row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: isWide ? 4 : 0 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>{def?.icon ?? "○"}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#64748b", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {f.key}
                    </span>
                    {!isWide && (
                      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
                        <FieldCell
                          fieldType={f.fieldType}
                          valueJson={f.valueJson}
                          onChange={nj => updateField(i, nj)}
                        />
                      </div>
                    )}
                    <button
                      onPointerDown={e => e.stopPropagation()}
                      onClick={e => {
                        e.stopPropagation()
                        update({ fields: props.fields.filter((_, j) => j !== i) })
                      }}
                      style={{ background: "none", border: "none", color: "#e2e8f0", cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1, flexShrink: 0 }}
                    >×</button>
                  </div>
                  {/* Wide value goes below label */}
                  {isWide && (
                    <div style={{ paddingLeft: 15 }}>
                      <FieldCell
                        fieldType={f.fieldType}
                        valueJson={f.valueJson}
                        onChange={nj => updateField(i, nj)}
                      />
                    </div>
                  )}
                </div>
              )
            })}

            {showAddField ? (
              <AddFieldWizard
                onAdd={field => {
                  update({ fields: [...props.fields, field] })
                  setShowAddField(false)
                }}
                onCancel={() => setShowAddField(false)}
              />
            ) : (
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); setShowAddField(true) }}
                style={{ ...addBtnStyle, alignSelf: "flex-start" }}
              >+ Add Field</button>
            )}
          </div>
        </Section>

        {/* ── 3. Resources ─────────────────────────────────────────────────── */}
        <Section icon="📎" label="Resources">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {props.resources.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <a
                  href={r.url || "#"} target="_blank" rel="noopener noreferrer"
                  onPointerDown={e => e.stopPropagation()}
                  style={{ fontSize: 11, color: "#6366f1", textDecoration: "none", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  🔗 {r.label}
                </a>
                <XBtn onClick={e => {
                  e.stopPropagation()
                  update({ resources: props.resources.filter((_, j) => j !== i) })
                }} />
              </div>
            ))}
            {showResForm ? (
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }} onPointerDown={e => e.stopPropagation()}>
                <input autoFocus value={newResLabel} onChange={e => setNewResLabel(e.target.value)}
                  placeholder="Label" style={{ ...miniInp, flex: 1, minWidth: 60 }} />
                <input value={newResUrl} onChange={e => setNewResUrl(e.target.value)}
                  placeholder="URL" onKeyDown={e => { if (e.key === "Enter") submitRes() }}
                  style={{ ...miniInp, flex: 1, minWidth: 80 }} />
                <button onClick={e => { e.stopPropagation(); submitRes() }}
                  style={{ ...addBtnStyle, borderStyle: "solid", background: "#22c55e22", color: "#22c55e" }}>✓</button>
                <button onClick={e => { e.stopPropagation(); setShowResForm(false) }}
                  style={addBtnStyle}>×</button>
              </div>
            ) : (
              <button onPointerDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); setShowResForm(true) }}
                style={addBtnStyle}>+ Add</button>
            )}
          </div>
        </Section>

        {/* ── 4. Scribble ──────────────────────────────────────────────────── */}
        <Section icon="✏️" label="Scribble"
          action={
            <button onPointerDown={e => e.stopPropagation()} onClick={clearScribble}
              style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#94a3b8", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}>
              Clear
            </button>
          }
        >
          <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 5 }}
            onPointerDown={e => e.stopPropagation()}>
            {SCRIBBLE_COLORS.map(c => (
              <button key={c}
                onPointerDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); setScribbleColor(c) }}
                style={{
                  width: 14, height: 14, borderRadius: "50%", background: c,
                  border: "none", cursor: "pointer", padding: 0,
                  outline: scribbleColor === c ? `2px solid ${c}` : "2px solid transparent",
                  outlineOffset: 2,
                }}
              />
            ))}
            <span style={{ fontSize: 9, color: "#cbd5e1", marginLeft: 2 }}>draw below ↓</span>
          </div>
          <canvas
            ref={canvasRef}
            width={CANVAS_W} height={CANVAS_H}
            onPointerDown={onDown} onPointerMove={onMove}
            onPointerUp={onUp} onPointerLeave={onUp}
            style={{
              width: "100%", height: 90, borderRadius: 6,
              border: "1px solid #e2e8f0", background: "#fafafa",
              cursor: "crosshair", display: "block", touchAction: "none",
            }}
          />
        </Section>

      </div>{/* end scrollable body */}

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <div style={{
        padding: "6px 12px 8px", borderTop: "1px solid #f1f5f9",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0, background: "#fff",
      }}>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 999,
          background: sc + "22", color: sc, border: `1px solid ${sc}44`,
        }}>
          {STATUS_LABEL[props.status]}
        </span>
        <div style={{ display: "flex", gap: 5 }}>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); openAnnouncements() }}
            style={{
              fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 6,
              background: "linear-gradient(135deg, #f97316, #db2777)",
              color: "#fff", border: "none", cursor: "pointer",
              fontFamily: "system-ui, sans-serif",
            }}
          >🎙️ Annc</button>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => {
              e.stopPropagation()
              // Store card props for the child canvas to seed itself on first load
              if (typeof window !== "undefined") {
                sessionStorage.setItem(ENTRY_KEY(shape.id), JSON.stringify(props))
              }
              // Mark this card as having a canvas
              editor.updateShape<TLTaskCardShape>({ id: shape.id, type: "task-card", props: { hasCanvas: true } })
              router.push(`/events/${eventId}/card/${encodeURIComponent(shape.id)}`)
            }}
            style={{
              fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 6,
              background: props.hasCanvas ? "#be185d" : "#fce7f3",
              color: props.hasCanvas ? "#fff" : "#be185d",
              border: "none", cursor: "pointer",
              fontFamily: "system-ui, sans-serif",
            }}
          >⬛ Canvas ↗</button>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => {
              e.stopPropagation()
              document.dispatchEvent(new CustomEvent("task-card:enter", {
                detail: { shapeId: shape.id, title: props.title },
              }))
            }}
            style={{
              fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 6,
              background: "#6366f1", color: "#fff", border: "none", cursor: "pointer",
              fontFamily: "system-ui, sans-serif",
            }}
          >Enter ↗</button>
        </div>
      </div>
    </div>
    </div>
  )
}
