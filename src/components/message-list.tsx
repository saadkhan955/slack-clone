import { GetMessagesReturnType } from "@/features/messages/api/use-get-messages";
import { format, isToday, isYesterday } from 'date-fns';

interface MessageListProps {
  memberName?: string
  memberImage?: string
  channelName?: string
  channelCreationTime?: Number
  variant?: "channel" | "thread" | "conversation"
  data: GetMessagesReturnType | undefined
  loadMore?: () => void
  isLoadingMore?: boolean
  canLoadMore?: boolean
}

const formatDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return format(date, "EEEE MMMM, d");
  }
}

export const MessageList = ({
  memberName,
  memberImage,
  channelName,
  channelCreationTime,
  variant = "channel",
  data,
  loadMore,
  isLoadingMore,
  canLoadMore
}: MessageListProps) => {

  const groupedMessages = data?.reduce((groups, message) => {
    const date = new Date(message._creationTime);
    const dateKey = format(date, "yyyy-MM-dd");
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].unshift(message);
    return groups;
  },
    {} as Record<string, typeof data>
  )

  return <div
    className="flex flex-col-reverse flex-1 pb-4 overflow-y-auto message-scrollbar">
    {Object.entries(groupedMessages || {}).map(([dateKey, message]) => (
      <div key={dateKey}>
        <div className="text-center my-2 relative">
          <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
          <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
            {formatDateLabel(dateKey)}
          </span>
        </div>
        {message.map((message, index) => {
          return (
            <div key={message._id}>
              {JSON.stringify(message)}
            </div>
          )
        })}
      </div>
    ))}
  </div>
}