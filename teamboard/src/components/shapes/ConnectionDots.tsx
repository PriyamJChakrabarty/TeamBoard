"use client"

import React from "react"

export type Side = "top" | "right" | "bottom" | "left"

export type ConnectionDragStartDetail = {
  fromShapeId: string
  fromSide: Side
  startX: number
  startY: number
}

const SIDES: Side[] = ["top", "right", "bottom", "left"]

const DOT_POS: Record<Side, React.CSSProperties> = {
  top:    { top: -6,  left: "50%", transform: "translateX(-50%)" },
  right:  { right: -6, top: "50%", transform: "translateY(-50%)" },
  bottom: { bottom: -6, left: "50%", transform: "translateX(-50%)" },
  left:   { left: -6, top: "50%", transform: "translateY(-50%)" },
}

export function ConnectionDots({ shapeId }: { shapeId: string }) {
  return (
    <>
      {SIDES.map((side) => (
        <div
          key={side}
          data-connection-dot={`${shapeId}:${side}`}
          onPointerDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
            document.dispatchEvent(
              new CustomEvent<ConnectionDragStartDetail>("connection-drag:start", {
                detail: {
                  fromShapeId: shapeId,
                  fromSide: side,
                  startX: rect.left + rect.width / 2,
                  startY: rect.top + rect.height / 2,
                },
              })
            )
          }}
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#6366f1",
            border: "2px solid #fff",
            cursor: "crosshair",
            zIndex: 20,
            boxShadow: "0 0 0 2.5px rgba(99,102,241,0.4)",
            ...DOT_POS[side],
          }}
        />
      ))}
    </>
  )
}
