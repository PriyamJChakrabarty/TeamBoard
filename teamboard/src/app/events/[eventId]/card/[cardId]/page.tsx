import { ChildWorkspaceCanvas } from "@/components/workspace/ChildWorkspaceCanvas"

type Props = { params: Promise<{ eventId: string; cardId: string }> }

export default async function CardCanvasPage({ params }: Props) {
  const { eventId, cardId } = await params
  return <ChildWorkspaceCanvas eventId={eventId} cardId={cardId} />
}
