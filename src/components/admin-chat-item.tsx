"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSocket } from "@/socket-context"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { motion } from "framer-motion"
import { Trash2, User } from "lucide-react"
import { toast } from "sonner"

import { Chat } from "@/types/admin-chats-list-reponse"
import { cn } from "@/lib/utils"
import useClickOutside from "@/hooks/use-click-outside"

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

const AdminChatItem = ({
  token,
  uuid,
  sender_name,
  receiver_name,
  is_sender_online,
  last_sender_active,
  is_receiver_online,
  last_receiver_active,
  sender_identifier,
  receiver_identifier,
  sender_guard,
  receiver_guard,
  sender_image,
  receiver_image,
  last_message,
  is_read,
  unread_messages,
  created_at,
  last_message_at,
  last_message_day,
  chat_link,
  access_token,
}: Chat & { token: string }) => {
  const [chatOptions, setChatOptions] = useState(false)
  const hasBeenMovedEnough = (value: number) => {
    if (value >= 120) {
      setChatOptions(true)
    }
  }

  const ref = useRef<React.ElementRef<"div">>(null)
  useClickOutside(ref, () => {
    setChatOptions(false)
  })

  // Get QueryClient from the context
  const queryClient = useQueryClient()

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

  const pathName = usePathname()

  return (
    <div dir="rtl" className="relative" ref={ref}>
      <Link href={`/admin/${token}/chats/${uuid}?token=${token}`}>
        <motion.div
          onDragEnd={(event, info) => hasBeenMovedEnough(info.offset.x)}
          drag="x"
          dragElastic={0.3}
          dragConstraints={{ left: 0, right: 0 }}
          className={cn(
            " relative flex   gap-2 border-b border-t bg-white px-6 py-4 duration-200",
            chatOptions && "!translate-x-[5.8rem]",
            pathName.includes(uuid) && " bg-gray-100",
          )}>
          <div className="flex gap-2">
            <div className="relative">
              <Avatar className=" relative aspect-square h-14 w-14">
                <AvatarImage src={receiver_image} />
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
              {is_receiver_online ? (
                <span className="absolute bottom-0 left-1 block h-4 w-4  rounded-full bg-green-500"></span>
              ) : null}
            </div>
          </div>

          <div>
            <div className="  mb-2 flex gap-1 text-sm">
              <span>{sender_name?.trim() || "ضيف"}</span>&
              <span>{receiver_name?.trim()}</span>
            </div>
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

export default AdminChatItem
