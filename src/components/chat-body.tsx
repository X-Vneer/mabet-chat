"use client"

import React, { useEffect, useReducer, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { getChat } from "@/api/helpers/get-chat"
import { useSocket } from "@/socket-context"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import {
  chatResponse,
  Message as MessageType,
  UserGuard,
} from "@/types/chat-response"
import { cn } from "@/lib/utils"

import ChatInput from "./chat-input"
import DateIndicator from "./date-indicator"
import Message from "./message"
import Loader from "./ui/loader"
import { ScrollArea } from "./ui/scroll-area"
import UnitCard from "./unit-card"

type Props = {
  chatID: string
  token: string
  className?: string
  userIdentifier: string
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

const ChatBody = ({ chatID, token, className, userIdentifier }: Props) => {
  const { data, isFetching, isFetched, isLoading } = useQuery<chatResponse>({
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
      socket.emit("setIdentifier", userIdentifier)
      socket.on("receiveMessage", receiveMessagesListener)
      socket.on("deletedMessage", deletedMessageListener)
      return () => {
        socket.off("receiveMessage", receiveMessagesListener)
        socket.off("deletedMessage", deletedMessageListener)
        socket.emit("leaveChat", chatID)
        socket.emit("removeIdentifier", userIdentifier)
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

  if (isLoading)
    return <Loader className="flex h-full w-full items-center justify-center" />
  return (
    <>
      <ScrollArea className={cn("relative h-[calc(100vh-250px)] pt-5", className)}>
        <div dir="rtl" className="mx-auto my-4  max-w-md px-4">
          <div className="flex items-start gap-3 rounded-lg border px-3 py-2 shadow-md">
            <div className=" aspect-square  rounded-lg border p-[6px] ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none">
                <rect width="32" height="32" fill="url(#pattern0)" />
                <defs>
                  <pattern
                    id="pattern0"
                    patternContentUnits="objectBoundingBox"
                    width="1"
                    height="1">
                    <use xlinkHref="#image0_1627_3558" transform="scale(0.005)" />
                  </pattern>
                  <image
                    id="image0_1627_3558"
                    width="200"
                    height="200"
                    xlinkHref="data:image/png;base64,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UmVhZHlxyWU8AAADI2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0MzUyLCAyMDIwLzAxLzMwLTE1OjUwOjM4ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMSAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6N0VFMTVGRjJBM0QxMTFFREJBN0ZEMTU0QTE0NkNCQzAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6N0VFMTVGRjNBM0QxMTFFREJBN0ZEMTU0QTE0NkNCQzAiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3RUUxNUZGMEEzRDExMUVEQkE3RkQxNTRBMTQ2Q0JDMCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo3RUUxNUZGMUEzRDExMUVEQkE3RkQxNTRBMTQ2Q0JDMCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PtytpLQAAA0fSURBVHja7J0JjBblGcffPWABl1sE6gHUC6yiaK3Vth6ttBRRg7U21mpq0xpJmrbaeDdWocUaTYxataVNTVPTKhotqMWLesuh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"
                  />
                </defs>
              </svg>
            </div>
            <p className="text-right text-sm font-semibold text-[#878787] ">
              رقم التواصل مع المضيف سيظهر مباشرة بعد الحجز!. لا تحرج المضيف وتطلب منه
              التواصل خارج المنصة” حيث أن ذلك سيتسبب بإيقاف حسابه ويلغي ضمان حقك.
            </p>
          </div>
        </div>

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
                  name={data!.data.user.name}
                  avatar={data!.data.user.avatar}
                />
              </div>
            </React.Fragment>
          )
        })}
      </ScrollArea>
      <ChatInput
        receiverIdentifier={data?.data.user.user_identifier || ""}
        dispatch={dispatch}
      />
    </>
  )
}

export default ChatBody
