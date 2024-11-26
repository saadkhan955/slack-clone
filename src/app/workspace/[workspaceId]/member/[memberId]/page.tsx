/* eslint-disable react-hooks/rules-of-hooks */
"use client"

import { AlertTriangle, Loader } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { useCreateOrGetConversation } from "@/features/conversations/api/use-create-or-get-conversation"
import { Id } from "../../../../../../convex/_generated/dataModel"

import { useMemberId } from "@/hooks/use-member-id"
import { useWorkspaceId } from "@/hooks/use-workspace-id"

import { Conversation } from "./conversation"


const memberIdPage = () => {
  const memberId = useMemberId()
  const workspaceId = useWorkspaceId()
  const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null)
  const { mutate, isPending } = useCreateOrGetConversation()

  useEffect(() => {
    mutate({
      workspaceId,
      memberId
    }, {
      onSuccess(data) {
        setConversationId(data)
      },
      onError() {
        toast.error("Failed to get or create conversation")
      },
      onSettled() { }
    })
  }, [workspaceId, memberId, mutate])

  if (isPending) {
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (!conversationId) {
    return (
      <div className="h-full flex flex-1 flex-col gap-y-2 items-center justify-center">
        <AlertTriangle className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Conversation not found.</span>
      </div>
    )
  }

  return <Conversation id={conversationId} />
}

export default memberIdPage