"use client"

import { Loader, TriangleAlert } from "lucide-react";

import { UseGetChannel } from "@/features/channels/api/use-get-channel";
import { UseGetMessages } from "@/features/messages/api/use-get-messages";

import { useChannelId } from "@/hooks/use-channel-id";

import { MessageList } from "@/components/message-list";
import { ChatInput } from "./chat-input";
import { Header } from "./header";

const ChannelIdPage = () => {
  const channelId = useChannelId()
  const { results, status, loadMore } = UseGetMessages({ channelId })
  const { data: channel, isLoading: channelLoading } = UseGetChannel({ id: channelId })
  console.log({ results });

  if (channelLoading || status === "LoadingFirstPage") {
    return (
      <div className="h-full flex flex-1 items-center justify-center">
        <Loader className="animate-spin size-5 text-muted-foreground" />
      </div>
    )
  }
  if (!channel) {
    return (
      <div className="h-full flex flex-1 flex-col gap-y-2 items-center justify-center">
        <TriangleAlert className="size-5 text-muted-foreground" />
        <span className="tex-sm text-muted-foreground">Channel not found</span>
      </div>
    )
  }
  return (
    <div className="flex flex-col h-full">
      <Header title={channel.name} />
      <MessageList
        channelName={channel.name}
        channelCreationTime={channel._creationTime}
        data={results}
        loadMore={loadMore}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
      />
      <ChatInput placeholder={`Message # ${channel.name}`} />
    </div>
  );
}

export default ChannelIdPage;