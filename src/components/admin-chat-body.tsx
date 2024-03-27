"use client"

import React, { useEffect, useReducer, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { getChat } from "@/api/helpers/get-chat"
import { useSocket } from "@/socket-context"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import {
  AdminChatResponse,
  Message as MessageType,
} from "@/types/admin-chat-response"
import { UserGuard } from "@/types/chat-response"
import { cn } from "@/lib/utils"

import AdminChatInput from "./admin-chat-input"
import DateIndicator from "./date-indicator"
import Message from "./message"
import Loader from "./ui/loader"
import { ScrollArea } from "./ui/scroll-area"
import UnitCard from "./unit-card"

type Props = {
  chatID: string
  token: string
}

export type Action =
  | { type: "updateState"; payload: MessageType[] }
  | { type: "sendingMessage"; payload: MessageType }
  | { type: "receiveMessage"; payload: MessageType }
  | { type: "messageSent"; payload: { messageID: number } }
  | { type: "messageError"; payload: { messageID: number } }
  | { type: "deleteMessage"; payload: { messageID: number } }

function reducer(state: MessageType[], action: Action) {
  switch (action.type) {
    case "updateState":
      return [...action.payload]
    case "receiveMessage":
      return [...state, action.payload]
    case "sendingMessage":
      return [...state, { ...action.payload, isLoading: true }]
    case "messageSent":
      return state.map((message) =>
        action.payload.messageID === message.id
          ? { ...message, isLoading: false, isError: false }
          : message,
      )
    case "messageError":
      return state.map((message) =>
        action.payload.messageID === message.id
          ? { ...message, isLoading: false, isError: true }
          : message,
      )
    case "deleteMessage":
      return state.filter((message) => action.payload.messageID !== message.id)

    default:
      return state
  }
}

const AdminChatBody = ({ chatID, token }: Props) => {
  const { data, isFetching, isFetched, isLoading } = useQuery<AdminChatResponse>({
    queryKey: [chatID],
    queryFn: async () => await getChat({ chatID, token }),
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
  })

  const [state, dispatch] = useReducer(reducer, data?.data.messages || [])
  useEffect(() => {
    if (!isFetching && data) {
      dispatch({ type: "updateState", payload: data.data.messages })
    }
  }, [isFetching])
  const lastMessageRef = useRef<HTMLDivElement>(null)

  const [numberOfMessages, setNumberOfMessages] = useState(0)
  useEffect(() => {
    // Scroll to the last message on mount
    if (lastMessageRef.current) {
      if (numberOfMessages < state.length || !numberOfMessages) {
        lastMessageRef.current.scrollIntoView()
      }
      setNumberOfMessages(state.length)
    }
  }, [state.length])

  const socket = useSocket()
  useEffect(() => {
    if (socket?.id) {
      const receiveMessagesListener = (message: MessageType) => {
        dispatch({ type: "receiveMessage", payload: message })
      }
      const deletedMessageListener = (messageID: number) => {
        dispatch({ type: "deleteMessage", payload: { messageID } })
      }
      socket.emit("joinChat", chatID)
      socket.on("receiveMessage", receiveMessagesListener)
      socket.on("deletedMessage", deletedMessageListener)
      return () => {
        socket.off("receiveMessage", receiveMessagesListener)
        socket.off("deletedMessage", deletedMessageListener)
      }
    }
  }, [socket?.id])

  const deleteMessage = async (messageID: number) => {
    try {
      await axios.post(`/api/messages/delete/${messageID}?token=${token}`)
      dispatch({ type: "deleteMessage", payload: { messageID } })
      socket?.emit("deleteMessage", chatID, messageID)
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.data) {
        toast.error(error.response.data.message)
      }
      toast.error("عذرا لم يتم حذف الرسالة!")
    }
  }

  if (isLoading) return <Loader />
  return (
    <>
      <ScrollArea className={"relative !h-[calc(100vh-410px)] pt-5"}>
        {state.map((message, index) => {
          return (
            <React.Fragment key={`message_${message.id}`}>
              {message.unit_id !== state[index - 1]?.unit_id ? (
                data?.data.unit?.[message.unit_id] ? (
                  <UnitCard unit={data!.data.unit?.[message.unit_id]} />
                ) : null
              ) : null}

              {message.date !== state[index - 1]?.date ? (
                <DateIndicator date={message.date} />
              ) : null}
              <div ref={index === state.length - 1 ? lastMessageRef : null}>
                <Message
                  deleteMessage={deleteMessage}
                  token={token}
                  chatID={chatID}
                  {...message}
                  user_guard={message.user_guard as UserGuard}
                  name={data!.data.user[message?.user_key!]?.name}
                  avatar={data!.data.user[message?.user_key!]?.avatar}
                />
              </div>
            </React.Fragment>
          )
        })}
      </ScrollArea>
      <AdminChatInput
        users={[
          data!.data.user[0].user_identifier,
          data!.data.user[1].user_identifier,
        ]}
        dispatch={dispatch}
      />
    </>
  )
}

export default AdminChatBody
