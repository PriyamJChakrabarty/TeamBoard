"use client"

import { useEffect, useRef, useState } from "react"
import { useEditor, TLShapeId } from "tldraw"
import { createShapeId } from "@tldraw/tlschema"
import type { ConnectionDragStartDetail, Side } from "../shapes/ConnectionDots"

type DragState = {
  fromShapeId: string
  fromSide: Side
  startX: number
  startY: number
  currentX: number
  currentY: number
}

const ANCHOR: Record<Side, { x: number; y: number }> = {
  top:    { x: 0.5, y: 0 },
  right:  { x: 1,   y: 0.5 },
  bottom: { x: 0.5, y: 1 },
  left:   { x: 0,   y: 0.5 },
}

export function ConnectionLayer() {
  const editor = useEditor()
  const [drag, setDrag] = useState<DragState | null>(null)
  const dragRef = useRef<DragState | null>(null)

  useEffect(() => {
    const onStart = (e: Event) => {
      const d = (e as CustomEvent<ConnectionDragStartDetail>).detail
      const state: DragState = {
        fromShapeId: d.fromShapeId,
        fromSide: d.fromSide,
        startX: d.startX,
        startY: d.startY,
        currentX: d.startX,
        currentY: d.startY,
      }
      dragRef.current = state
      setDrag(state)
    }

    const onMove = (e: PointerEvent) => {
      if (!dragRef.current) return
      const updated = { ...dragRef.current, currentX: e.clientX, currentY: e.clientY }
      dragRef.current = updated
      setDrag(updated)
    }

    const onUp = (e: PointerEvent) => {
      const d = dragRef.current
      dragRef.current = null
      setDrag(null)
      if (!d) return

      const els = document.elementsFromPoint(e.clientX, e.clientY)
      const targetEl = els.find((el) => el.getAttribute("data-connection-dot"))
      if (!targetEl) return

      const attr = targetEl.getAttribute("data-connection-dot")!
      const colonIdx = attr.lastIndexOf(":")
      const toShapeId = attr.slice(0, colonIdx)
      const toSide = attr.slice(colonIdx + 1) as Side
      if (toShapeId === d.fromShapeId) return

      const startPage = editor.screenToPage({ x: d.startX, y: d.startY })
      const endPage = editor.screenToPage({ x: e.clientX, y: e.clientY })
      const arrowId = createShapeId()

      editor.run(() => {
        editor.createShape({
          id: arrowId,
          type: "arrow",
          x: startPage.x,
          y: startPage.y,
          props: {
            start: { x: 0, y: 0 },
            end: { x: endPage.x - startPage.x, y: endPage.y - startPage.y },
            color: "grey",
            size: "s",
            arrowheadStart: "none",
            arrowheadEnd: "arrow",
          },
          meta: {
            fromShapeId: d.fromShapeId,
            fromSide: d.fromSide,
            toShapeId,
            toSide,
          },
        })

        editor.createBinding({
          type: "arrow",
          fromId: arrowId,
          toId: d.fromShapeId as TLShapeId,
          props: {
            terminal: "start",
            normalizedAnchor: ANCHOR[d.fromSide],
            isExact: false,
            isPrecise: true,
            snap: "none",
          },
        })

        editor.createBinding({
          type: "arrow",
          fromId: arrowId,
          toId: toShapeId as TLShapeId,
          props: {
            terminal: "end",
            normalizedAnchor: ANCHOR[toSide],
            isExact: false,
            isPrecise: true,
            snap: "none",
          },
        })
      })
    }

    document.addEventListener("connection-drag:start", onStart)
    document.addEventListener("pointermove", onMove)
    document.addEventListener("pointerup", onUp)
    return () => {
      document.removeEventListener("connection-drag:start", onStart)
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerup", onUp)
    }
  }, [editor])

  if (!drag) return null

  return (
    <svg
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "visible",
      }}
    >
      <defs>
        <marker
          id="conn-arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#6366f1" />
        </marker>
      </defs>
      <line
        x1={drag.startX}
        y1={drag.startY}
        x2={drag.currentX}
        y2={drag.currentY}
        stroke="#6366f1"
        strokeWidth={2.5}
        strokeDasharray="7 4"
        markerEnd="url(#conn-arrowhead)"
        strokeLinecap="round"
      />
      <circle cx={drag.startX} cy={drag.startY} r={4} fill="#6366f1" />
    </svg>
  )
}
