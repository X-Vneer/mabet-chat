"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { useSocket } from "@/socket-context"
import { formatDate } from "@/utils/formateDate"
import { formatTimeTo12HourClock } from "@/utils/formatTimeTo12HourClock"
import axios from "axios"

import { UserGuard } from "@/types/chat-response"

import { Action } from "./admin-chat-body"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"

type Props = {
  dispatch: React.Dispatch<Action>
  users: [string, string]
}

const AdminChatInput = ({ dispatch, users }: Props) => {
  const textAreRef = useRef<HTMLTextAreaElement>(null)
  const socket = useSocket()

  // dynamic resizing text area
  const textRowCount = textAreRef.current
    ? textAreRef.current.value.split("\n").length
    : 1
  const rows = textRowCount <= 3 ? textRowCount : 3

  const [inputMessage, setInputMessage] = useState("")
  const handleInputMessageChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    e,
  ) => {
    setInputMessage(e.target.value)
  }

  const { chatID } = useParams<{ chatID: string }>()!
  const handleSendMessage = async () => {
    const messageID = Math.random() + Math.random()
    try {
      const newMessage = {
        id: messageID,
        chat_id: chatID as string,
        message: inputMessage,
        is_me: true,
        sent_at: formatTimeTo12HourClock(new Date()),
        date: formatDate(new Date()),
        isLoading: true,
      }
      dispatch({
        type: "sendingMessage",
        payload: { ...newMessage, unit_id: "" },
      })
      setInputMessage("")

      const searchParams = new URLSearchParams(window.location.search)
      const token = searchParams.get("token")
      const response = await axios.post<{
        data: {
          chat_id: number
          guard: UserGuard
          id: number
          message: string
        }
      }>("/api/messages/send", {
        chatID: chatID as string,
        token,
        message: inputMessage,
      })
      socket?.emit(
        "sendMessage",
        { ...newMessage, ...response.data.data, isLoading: false, isError: false },
        chatID,
        users[0],
        users[1],
      )
      dispatch({
        type: "messageSent",
        payload: {
          messageID: messageID,
        },
      })
    } catch (error) {
      console.log("🚀 ~ handleSendMessage ~ error:", error)
      dispatch({
        type: "messageError",
        payload: {
          messageID: messageID,
        },
      })
    }
  }

  // handling sending message using enter key
  const handleEnterKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e,
  ) => {
    const keyDown = e.key
    if (keyDown === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="!my-4  flex items-center gap-4 px-4">
      <div className="relative w-full">
        <Textarea
          ref={textAreRef}
          rows={rows}
          placeholder="اكتب ما تريد الاستفسار عنه ....."
          value={inputMessage}
          onChange={handleInputMessageChange}
          onKeyDown={handleEnterKeyDown}
          className=" min-h-[40px] resize-none rounded-xl border-[#EBEBEB] bg-white py-3 pl-11 shadow placeholder:font-bold placeholder:text-[#A1A1A1]"
        />
      </div>
      <Button
        onClick={handleSendMessage}
        type="submit"
        className=" shrink-0 font-bold ">
        ارسال
      </Button>
    </div>
  )
}

export default AdminChatInput
