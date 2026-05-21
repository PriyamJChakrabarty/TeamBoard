import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas"

type Props = {
  params: Promise<{ eventId: string }>
}

export default async function EventWorkspacePage({ params }: Props) {
  const { eventId } = await params
  return <WorkspaceCanvas eventId={eventId} />
}
