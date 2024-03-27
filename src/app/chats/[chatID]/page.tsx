import { notFound } from "next/navigation"
import { getChat } from "@/api/helpers/get-chat"
import { getMe } from "@/api/helpers/get-me"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { User } from "lucide-react"

import { chatResponse } from "@/types/chat-response"
import ActionButton from "@/components/ui/action-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import GoBackButton from "@/components/ui/go-back-button"
import ChatBody from "@/components/chat-body"
import UserState from "@/components/user-satate"

export const dynamic = "force-dynamic"
export default async function Page({
  params: { chatID },
  searchParams,
}: {
  params: { chatID: string }
  searchParams: { [key: string]: string | undefined }
}) {
  if (!searchParams.token) return notFound()
  const { token } = searchParams

  const [chatData, me] = await Promise.all([
    getChat<chatResponse>({ chatID, token }),
    getMe({ token: searchParams.token! }),
  ])

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: [chatID],
    queryFn: async () => await getChat({ chatID, token }),
  })

  return (
    <main>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="space-y-6 rounded-b-2xl bg-gradient-conic p-6 pt-20 text-white">
          <div className="flex items-center justify-between gap-4 ">
            <GoBackButton />
            <div className="flex grow items-center gap-2">
              <Avatar className="h-[60px] w-[60px] border-[3px] border-white">
                <AvatarImage src={chatData.data.user.avatar} />
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="mb-2 font-bold">{chatData.data.user.name}</p>
                <UserState chatID={chatID} token={token} />
              </div>
            </div>
            {/* <ActionButton action="chat-options" /> */}
            <span></span>
          </div>
        </div>
        <ChatBody
          userIdentifier={me.data.user.user.user_identifier}
          chatID={chatID}
          token={token}
        />
      </HydrationBoundary>
    </main>
  )
}
