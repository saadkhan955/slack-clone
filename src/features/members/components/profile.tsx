import { AlertTriangle, ChevronDown, ChevronDownIcon, Loader, MailIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useCurrentMember } from "../api/use-current-member";
import { useGetMember } from "../api/use-get-member";
import { useRemoveMember } from "../api/use-remove-member";
import { useUpdateMember } from "../api/use-update-member";

import { Id } from "../../../../convex/_generated/dataModel";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";


interface ProfileProps {
  memberId: Id<"members">
  onClose: () => void
}

export const Profile = ({ memberId, onClose }: ProfileProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId()

  const [LeaveDialog, confirmLeave] = useConfirm("Leave workspace", "Are you sure you want to leave this workspace?")
  const [RemoveDialog, confirmRemove] = useConfirm("Remove Member", "Are you sure you want to remove this member?")
  const [UpdateDialog, confirmUpdate] = useConfirm("Change role", "Are you sure you want to change this member's role?")

  const { data: currentMember, isLoading: isLoadingCurrentMember } = useCurrentMember({ workspaceId })
  const { data: member, isLoading: isLoadingMember } = useGetMember({ id: memberId })

  const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateMember()
  const { mutate: removeMember, isPending: isRemovingMember } = useRemoveMember()

  const onRemove = async () => {
    const ok = await confirmRemove()
    if (!ok) return

    removeMember({ id: memberId },
      {
        onSuccess() {
          toast.success("Member removed")
          onClose()
        },
        onError() {
          toast.error("Failed to remove member")
        },
        onSettled() { }
      }
    )
  }
  const onLeave = async () => {
    const ok = await confirmLeave()
    if (!ok) return

    removeMember({ id: memberId },
      {
        onSuccess() {
          router.replace("/")
          toast.success("You left the workspace")
          onClose()
        },
        onError() {
          toast.error("Failed to leave workspace")
        },
        onSettled() { }
      }
    )
  }
  const onRoleChange = async (role: "admin" | "member") => {
    const ok = await confirmUpdate()
    if (!ok) return

    updateMember({ id: memberId, role },
      {
        onSuccess() {
          toast.success("Role updated")
          onClose()
        },
        onError() {
          toast.error("Failed to update role")
        },
        onSettled() { }
      }
    )
  }

  if (isLoadingMember || isLoadingCurrentMember) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center px-4 h-[49px] border-b">
          <p className="text-lg font-bold">Profile</p>
          <Button onClick={onClose} size={"iconSm"} variant={"ghost"}>
            <XIcon className="size-5 start-1.5" />
          </Button>
        </div>
        <div className="flex flex-col gap-y-2 h-full items-center justify-center">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }
  if (!member) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center px-4 h-[49px] border-b">
          <p className="text-lg font-bold">Profile</p>
          <Button onClick={onClose} size={"iconSm"} variant={"ghost"}>
            <XIcon className="size-5 start-1.5" />
          </Button>
        </div>
        <div className="flex flex-col gap-y-2 h-full items-center justify-center">
          <AlertTriangle className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Profile not found</p>
        </div>
      </div>
    )
  }
  const avatarFallback = member.user.name?.[0] ?? "M";
  return (
    <>
      <RemoveDialog />
      <UpdateDialog />
      <LeaveDialog />
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center px-4 h-[49px] border-b">
          <p className="text-lg font-bold">Profile</p>
          <Button onClick={onClose} size={"iconSm"} variant={"ghost"}>
            <XIcon className="size-5 start-1.5" />
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center p-4">
          <Avatar className="max-w-[256px] max-h-[256px] size-full">
            <AvatarImage src={member.user.image} />
            <AvatarFallback className="aspect-square text-6xl">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col p-4">
          <p className="text-lg font-bold">{member.user.name}</p>
          {currentMember?.role === "admin" &&
            currentMember._id !== memberId ? (
            <div className="flex items-center gap-2 mt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full capitalize"
                  >
                    {member.role} <ChevronDownIcon className="size-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuRadioGroup
                    value={member.role}
                    onValueChange={(role) => onRoleChange(role as "admin" | "member")}
                  >
                    <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="member">Member</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant={"outline"}
                className="w-full"
                onClick={onRemove}
              >
                Remove
              </Button>
            </div>
          ) : currentMember?._id === memberId &&
            currentMember?.role !== "admin" ? (
            <div
              className="mt-4"
            >
              <Button
                variant={"outline"}
                className="w-full"
                onClick={onLeave}
              >
                Leave
              </Button>
            </div>
          ) : null
          }
        </div>
        <Separator />
        <div className="flex flex-col p-4">
          <p className="text-sm font-bold mb-4">Contact information</p>
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-md bg-muted flex items-center justify-center">
              <MailIcon className="size-4" />
            </div>
            <div className="flex flex-col">
              <p className="text-[13px] font-semibold text-muted-foreground">
                Email address
              </p>
              <Link
                href={`mailto:${member.user.email}`}
                className="text-sm hover:underline text-[#1264a3]"
              >
                {member.user.email}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}