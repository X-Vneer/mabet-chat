import { getChat } from "@/api/helpers/get-chat"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { User } from "lucide-react"

import { AdminChatResponse } from "@/types/admin-chat-response"
import ActionButton from "@/components/ui/action-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import GoBackButton from "@/components/ui/go-back-button"
import AdminChatBody from "@/components/admin-chat-body"
import UserState from "@/components/user-satate"

export const dynamic = "force-dynamic"
export default async function Page({
  params,
}: {
  params: { chatID: string; token: string }
}) {
  const chatID = params.chatID
  const token = params.token.replace("%7C", "|")
  const chatData = await getChat<AdminChatResponse>({ chatID, token })
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: [chatID],
    queryFn: async () => await getChat({ chatID, token }),
  })
  return (
    <main>
      <div className="space-y-6 rounded-b-2xl  p-6  text-primary">
        <div className="flex items-center justify-between gap-4 ">
          <GoBackButton />
          <div className="flex grow items-center gap-2">
            <Avatar className="h-[60px] w-[60px] border-[3px] border-primary">
              <AvatarImage src={chatData.data.user[0].avatar} />
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="mb-2 font-bold">{chatData.data.user[0].name}</p>
              <UserState chatID={chatID} token={token} />
            </div>
          </div>
          <ActionButton action={{ type: "chat-options", payload: "" }} />
        </div>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AdminChatBody
          className="h-[calc(100vh-370px)]"
          chatID={chatID}
          token={token}
        />
      </HydrationBoundary>
    </main>
  )
}
