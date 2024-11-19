import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef, useState } from "react";

import { UseCreateMessage } from "@/features/messages/api/use-create-message";
import { UseGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { toast } from "sonner";
import { Id } from "../../../../../../convex/_generated/dataModel";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface ChatInputProps {
  placeholder: string
}

type CreateMessageValues = {
  channelId: Id<"channels">
  workspaceId: Id<"workspaces">
  body: string
  image: Id<"_storage"> | undefined
}

export const ChatInput = ({ placeholder }: ChatInputProps) => {

  const [editorKey, setEditorKey] = useState(0)
  const [isPending, setIsPending] = useState(false)

  const editorRef = useRef<Quill | null>(null);
  const workspaceId = useWorkspaceId()
  const channelId = useChannelId()
  const { mutate: generateUploadUrl } = UseGenerateUploadUrl()
  const { mutate: createMessage } = UseCreateMessage()

  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    try {
      setIsPending(true)
      editorRef?.current?.enable(false)

      const values: CreateMessageValues = {
        channelId,
        workspaceId,
        body,
        image: undefined
      }

      if (image) {
        const url = await generateUploadUrl({}, {
          throwError: true,
          onSuccess: () => { },
          onError: (error) => { },
          onSettled: () => { },
        })

        if (!url) {
          throw new Error("Failed to generate upload url")
        }

        const result = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": image.type
          },
          body: image
        })

        if (!result.ok) {
          throw new Error("Failed to upload image")
        }

        const { storageId } = await result.json()

        values.image = storageId
      }

      await createMessage(values, {
        throwError: true,
        onSuccess: () => { },
        onError: (error) => { },
        onSettled: () => { },
      })

      setEditorKey((prevKey) => prevKey + 1)
    } catch (error) {
      toast.error("Failed to send message")
    } finally {
      setIsPending(false)
      editorRef?.current?.enable(true)
    }
  }

  return (
    <div className="px-5 w-full">
      <Editor
        key={editorKey}
        placeholder={placeholder}
        onSubmit={handleSubmit}
        disabled={isPending}
        innerRef={editorRef}
      />
    </div>
  );
};
