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
import { AnnouncementCardComponent } from "./AnnouncementCardComponent"

// ─── Props ────────────────────────────────────────────────────────────────────

export type AnnouncementCardProps = {
  w: number
  h: number
  title: string
  body: string
}

// ─── Module augmentation ──────────────────────────────────────────────────────

declare module "tldraw" {
  interface TLGlobalShapePropsMap {
    "announcement-card": AnnouncementCardProps
  }
}

export type TLAnnouncementCardShape = TLShape<"announcement-card">

// ─── ShapeUtil ────────────────────────────────────────────────────────────────

export class AnnouncementCardShapeUtil extends ShapeUtil<TLAnnouncementCardShape> {
  static override type = "announcement-card" as const

  static override props = {
    w: T.number,
    h: T.number,
    title: T.string,
    body: T.string,
  }

  override getDefaultProps(): AnnouncementCardProps {
    return {
      w: 300,
      h: 180,
      title: "New Announcement",
      body: "",
    }
  }

  override getGeometry(shape: TLAnnouncementCardShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  override getIndicatorPath(shape: TLAnnouncementCardShape): Path2D {
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

  override component(shape: TLAnnouncementCardShape) {
    return (
      <HTMLContainer
        id={shape.id}
        style={{ pointerEvents: "all", width: "100%", height: "100%" }}
      >
        <AnnouncementCardComponent shape={shape} />
      </HTMLContainer>
    )
  }

  override onResize(_shape: TLAnnouncementCardShape, info: TLResizeInfo<TLAnnouncementCardShape>) {
    const { initialShape, scaleX, scaleY } = info
    return {
      props: {
        w: Math.max(220, initialShape.props.w * Math.abs(scaleX)),
        h: Math.max(120, initialShape.props.h * Math.abs(scaleY)),
      },
    }
  }
}

// ─── Tool ─────────────────────────────────────────────────────────────────────

export class AnnouncementCardTool extends StateNode {
  static override id = "announcement-card"

  override onPointerDown(_info: TLPointerEventInfo) {
    const { x, y } = this.editor.inputs.getCurrentPagePoint()
    const util = new AnnouncementCardShapeUtil(this.editor)
    const defaults = util.getDefaultProps()
    this.editor.createShape<TLAnnouncementCardShape>({
      type: "announcement-card",
      x: x - defaults.w / 2,
      y: y - defaults.h / 2,
      props: defaults,
    })
    this.editor.setCurrentTool("select")
  }
}
