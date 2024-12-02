import { Loader } from "lucide-react";

import { useMemberId } from "@/hooks/use-member-id";
import { usePanel } from "@/hooks/use-panel";

import { useGetMember } from "@/features/members/api/use-get-member";
import { UseGetMessages } from "@/features/messages/api/use-get-messages";

import { MessageList } from "@/components/message-list";

import { ChatInput } from "./chat-input";
import { Header } from "./header";

import { Id } from "../../../../../../convex/_generated/dataModel";

interface ConversationProps {
  id: Id<"conversations">
}

export const Conversation = ({ id }: ConversationProps) => {

  const memberId = useMemberId()
  const { onOpeProfile } = usePanel();
  const { data: member, isLoading: memberLoading } = useGetMember({ id: memberId })
  const { results, status, loadMore } = UseGetMessages({ conversationId: id })

  if (memberLoading || status === "LoadingFirstPage") {
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        memberName={member?.user.name}
        memberImage={member?.user.image}
        onClick={() => onOpeProfile(memberId)}
      />
      <MessageList
        data={results}
        variant="conversation"
        memberImage={member?.user.image}
        memberName={member?.user.name}
        loadMore={loadMore}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
      />
      <ChatInput
        placeholder={`Message ${member?.user.name}`}
        conversationId={id}

      />
    </div>
  )
}