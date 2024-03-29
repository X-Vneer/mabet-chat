"use client"

import React, { useEffect, useRef } from "react"
import { getChatList } from "@/api/helpers/get-chat-list"
import { useSocket } from "@/socket-context"
import { useAppStore } from "@/stores/app-store-provider"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"

import { ChatListsResponse } from "@/types/chat-list-response"
import { Message } from "@/types/chat-response"

import ChatItem from "./chat-item"
import Loader from "./ui/loader"
import { ScrollArea } from "./ui/scroll-area"

type Props = {
  token: string
  userIdentifier: string
}

const ViewChats = ({ token, userIdentifier }: Props) => {
  const chatsQuery = useAppStore((state) => state.chatsQuery)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<ChatListsResponse>({
    queryKey: ["chat-lists", chatsQuery],
    queryFn: async ({ pageParam }) => {
      return await getChatList({
        token: token,
        pageParam: pageParam + "",
        query: chatsQuery,
      })
    },
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.data.current_page === lastPage.data.last_page
        ? null
        : lastPage.data.current_page + 1
    },
  })

  const socket = useSocket()
  // Get QueryClient from the context
  const queryClient = useQueryClient()

  useEffect(() => {
    if (socket?.id) {
      socket.emit("online", token)

      const receiveMessagesListener = (message: Message, chatID: string) => {
        queryClient.invalidateQueries({ queryKey: [chatID] })
        queryClient.refetchQueries({ queryKey: ["chat-lists"] })
      }
      socket.emit("setIdentifier", userIdentifier)

      socket.on("receiveMessage", receiveMessagesListener)
      return () => {
        socket.off("receiveMessage", receiveMessagesListener)
        socket.emit("removeIdentifier", userIdentifier)
      }
    }
  }, [socket?.id])

  const ref = useRef<React.ElementRef<"div">>(null)
  useEffect(() => {
    if (
      isFetching ||
      isFetchingNextPage ||
      !ref.current ||
      !hasNextPage ||
      isLoading
    )
      return
    const observer = new IntersectionObserver((entries, observe) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fetchNextPage()
        }
      })
    })

    observer.observe(ref.current!)

    return () => {
      observer.disconnect()
    }
  }, [isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, isLoading])

  return (
    <>
      <div className="border-b px-6 shadow-md ">
        <h2 className=" pb-4 text-xl font-bold">جميع المحادثات</h2>
      </div>
      {isLoading ? (
        <Loader className="flex justify-center py-10" />
      ) : (
        <ScrollArea className="h-[calc(100vh-420px)]">
          {data?.pages
            ?.flatMap((element) => element.data.chats)
            .map((chat, i) => (
              <ChatItem
                userIdentifier={userIdentifier}
                key={`chat_${chat.uuid}`}
                {...chat}
                token={token}
              />
            ))}

          <div className="h-5 " ref={ref}></div>
        </ScrollArea>
      )}
    </>
  )
}

export default ViewChats
