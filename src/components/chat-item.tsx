"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSocket } from "@/socket-context"
import { useAppStore } from "@/stores/app-store-provider"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { motion } from "framer-motion"
import { Star, Trash2, User } from "lucide-react"
import { toast } from "sonner"

import { Chat } from "@/types/chat-list-response"
import { cn } from "@/lib/utils"
import useClickOutside from "@/hooks/use-click-outside"

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

const ChatItem = ({
  token,
  uuid,
  chat_name,
  last_message,
  is_read,
  unread_messages,
  chat_image,
  created_at,
  last_message_at,
  last_message_day,
  chat_link,
  access_token,
  is_user_online,
  userIdentifier,
}: Chat & { token: string; userIdentifier: string }) => {
  const [chatOptions, setChatOptions] = useState(false)
  const hasBeenMovedEnough = (value: number) => {
    if (value >= 120) {
      setChatOptions(true)
    }
  }

  const setDrawer = useAppStore((state) => state.setDrawer)

  const handleShowReviews = () => {
    setDrawer({ type: "show-reviews", payload: "" })
  }

  const ref = useRef<React.ElementRef<"div">>(null)
  useClickOutside(ref, () => {
    setChatOptions(false)
  })

  // Get QueryClient from the context
  const queryClient = useQueryClient()

  const handleDeleteChat: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.stopPropagation()
    e.preventDefault()
    try {
      const deleteChat = axios.post(`/api/chats/${uuid}?token=${token}`)

      toast.promise(deleteChat, {
        loading: "جاري حذف المحادثة",
        success: (data) => {
          return "تم حذف المحادثة"
        },
        error: "لم حذف المحادثة",
      })
      await deleteChat
      await queryClient.refetchQueries({ queryKey: ["chat-lists"] })
    } catch (error) {
      toast.error("لم حذف المحادثة")
    }
    setChatOptions(false)
  }

  const [isTyping, setIsTyping] = useState(false)

  const socket = useSocket()
  const handleTypingState = (isTyping: boolean, chatID: string) => {
    setIsTyping(isTyping && chatID === uuid)
  }
  useEffect(() => {
    if (socket?.id) {
      socket.on("typing", handleTypingState)
      return () => {
        socket.off("typing", handleTypingState)
      }
    }
  }, [socket, uuid])

  return (
    <div dir="rtl" className="relative" ref={ref}>
      <Link href={`/chats/${uuid}?token=${token}`}>
        <button
          onClick={handleDeleteChat}
          type="button"
          className=" absolute bottom-[1px] left-0 top-[1px] flex aspect-square  flex-col items-center justify-center gap-2 bg-[#263238] text-white">
          <span className="block text-[10px] font-bold">مسح المحادثة</span>
          <Trash2 />
        </button>
        <button
          onClick={handleShowReviews}
          type="button"
          className=" absolute bottom-[1px] left-[5.6rem] top-[1px] flex aspect-square  flex-col items-center justify-center gap-2 bg-yellow-400 text-white">
          <span className="block text-[10px] font-bold">تقيمات العميل</span>
          <Star />
        </button>
        <motion.div
          onDragEnd={(event, info) => hasBeenMovedEnough(info.offset.x)}
          drag="x"
          dragElastic={0.1}
          dragConstraints={{ left: 0, right: 0 }}
          className={cn(
            " relative flex   gap-2 border-b border-t bg-white px-6 py-4 duration-200",
            chatOptions && "!translate-x-[11.2rem]",
          )}>
          <div className="relative">
            <Avatar className=" relative aspect-square h-14 w-14">
              <AvatarImage src={chat_image} />
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </Avatar>
            {is_user_online ? (
              <span className="absolute bottom-0 left-1 block h-4 w-4  rounded-full bg-green-500"></span>
            ) : null}
          </div>
          <div>
            <p className="text-[14px] font-bold leading-loose text-secondaryColor">
              {chat_name}
            </p>
            <span
              className={cn(
                "block max-w-40 truncate text-sm font-semibold leading-loose text-[#7B7B7B]",
                !is_read && "font-bold text-black",
              )}>
              {isTyping ? (
                <span className="font-bold text-primary">يكتب...</span>
              ) : (
                last_message
              )}
            </span>
          </div>
          <div className=" mr-auto">
            {/* <span className="block text-sm">
              {new Date(lastMessage.time).toLocaleDateString("ar")}
            </span> */}
            <span className="block text-sm leading-loose text-[#494949] ">
              {last_message_day}
            </span>
            {!!unread_messages ? (
              <span className="mt-2 block w-fit rounded bg-green-100 p-1 text-[10px] font-bold text-green-500 ">
                {unread_messages}{" "}
                {unread_messages === 1 ? "رسالة جديدة" : "رسائل جديدة"}
              </span>
            ) : null}
          </div>
        </motion.div>
      </Link>
    </div>
  )
}

export default ChatItem
