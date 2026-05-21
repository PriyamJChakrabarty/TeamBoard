"use client"

import {
  HTMLContainer,
  Rectangle2d,
  ShapeUtil,
  StateNode,
  T,
  TLPointerEventInfo,
  TLResizeInfo,
  TLShape,
} from "tldraw"
import { TaskCardComponent } from "./TaskCardComponent"

// ─── Props ────────────────────────────────────────────────────────────────────

export type StoredField = {
  key: string        // user-defined label
  fieldType: string  // one of the FieldType values
  valueJson: string  // JSON-encoded value (structure depends on fieldType)
}

export type TaskCardProps = {
  w: number
  h: number
  title: string
  description: string
  // used for accent bar color + footer badge
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  assignees: string[]
  fields: StoredField[]
  resources: { label: string; url: string }[]
  scribbleData: string
  hasCanvas: boolean
}

// ─── Module augmentation ──────────────────────────────────────────────────────

declare module "tldraw" {
  interface TLGlobalShapePropsMap {
    "task-card": TaskCardProps
  }
}

export type TLTaskCardShape = TLShape<"task-card">

// ─── ShapeUtil ────────────────────────────────────────────────────────────────

export class TaskCardShapeUtil extends ShapeUtil<TLTaskCardShape> {
  static override type = "task-card" as const

  static override props = {
    w: T.number,
    h: T.number,
    title: T.string,
    description: T.string,
    status: T.literalEnum("todo", "in-progress", "done"),
    priority: T.literalEnum("low", "medium", "high"),
    assignees: T.arrayOf(T.string),
    fields: T.arrayOf(T.object({ key: T.string, fieldType: T.string, valueJson: T.string })),
    resources: T.arrayOf(T.object({ label: T.string, url: T.string })),
    scribbleData: T.string,
    hasCanvas: T.boolean,
  }

  override getDefaultProps(): TaskCardProps {
    return {
      w: 300,
      h: 480,
      title: "New Task",
      description: "Add a description...",
      status: "todo",
      priority: "medium",
      assignees: [],
      fields: [],
      resources: [],
      scribbleData: "",
      hasCanvas: false,
    }
  }

  override getGeometry(shape: TLTaskCardShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  override getIndicatorPath(shape: TLTaskCardShape): Path2D {
    const path = new Path2D()
    const r = 12
    const { w, h } = shape.props
    path.moveTo(r, 0)
    path.lineTo(w - r, 0)
    path.arcTo(w, 0, w, r, r)
    path.lineTo(w, h - r)
    path.arcTo(w, h, w - r, h, r)
    path.lineTo(r, h)
    path.arcTo(0, h, 0, h - r, r)
    path.lineTo(0, r)
    path.arcTo(0, 0, r, 0, r)
    path.closePath()
    return path
  }

  override component(shape: TLTaskCardShape) {
    return (
      <HTMLContainer
        id={shape.id}
        style={{ pointerEvents: "all", width: "100%", height: "100%" }}
      >
        <TaskCardComponent shape={shape} />
      </HTMLContainer>
    )
  }

  override onResize(_shape: TLTaskCardShape, info: TLResizeInfo<TLTaskCardShape>) {
    const { initialShape, scaleX, scaleY } = info
    return {
      props: {
        w: Math.max(240, initialShape.props.w * Math.abs(scaleX)),
        h: Math.max(200, initialShape.props.h * Math.abs(scaleY)),
      },
    }
  }
}

// ─── Tool ─────────────────────────────────────────────────────────────────────

export class TaskCardTool extends StateNode {
  static override id = "task-card"

  override onPointerDown(_info: TLPointerEventInfo) {
    const { x, y } = this.editor.inputs.getCurrentPagePoint()
    const util = new TaskCardShapeUtil(this.editor)
    const defaults = util.getDefaultProps()
    this.editor.createShape<TLTaskCardShape>({
      type: "task-card",
      x: x - defaults.w / 2,
      y: y - defaults.h / 2,
      props: defaults,
    })
    this.editor.setCurrentTool("select")
  }
}
