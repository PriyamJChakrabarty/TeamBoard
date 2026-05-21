"use client"

import { useEffect } from "react"
import { useEditor } from "tldraw"
import type { TLTaskCardShape } from "../shapes/TaskCardShape"

const SEED_KEY = (cardId: string) => `tb-canvas-seeded-${cardId}`
const ENTRY_KEY = (cardId: string) => `tb-canvas-entry-${cardId}`

export function CanvasSeedLayer({ cardId }: { cardId: string }) {
  const editor = useEditor()

  useEffect(() => {
    if (typeof window === "undefined") return
    if (localStorage.getItem(SEED_KEY(cardId))) return

    const raw = sessionStorage.getItem(ENTRY_KEY(cardId))
    if (raw) {
      try {
        const props = JSON.parse(raw)
        // Place the originating task card at the center of the viewport
        const vp = editor.getViewportPageBounds()
        const x = vp.x + vp.w / 2 - (props.w ?? 300) / 2
        const y = vp.y + vp.h / 2 - (props.h ?? 480) / 2
        editor.createShape<TLTaskCardShape>({
          type: "task-card",
          x,
          y,
          props: { ...props, hasCanvas: false },
        })
        sessionStorage.removeItem(ENTRY_KEY(cardId))
      } catch {
        // ignore bad JSON
      }
    }

    localStorage.setItem(SEED_KEY(cardId), "1")
  }, [cardId, editor])

  return null
}

export { ENTRY_KEY }
