// pages/api/socket.ts

import type { Server as HTTPServer } from "http"
import type { Socket as NetSocket } from "net"
import type { NextApiRequest, NextApiResponse } from "next"
import type { Server as IOServer } from "socket.io"
import { Server } from "socket.io"

import { type Message } from "@/types/chat-response"

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO
}
export default function SocketHandler(
  _req: NextApiRequest,
  res: NextApiResponseWithSocket,
) {
  if (res.socket.server.io) {
    res.status(200).json({ message: "Socket is already running" })
    return
  }

  const io = new Server(res.socket.server, {
    path: "/api/socket_io",
    addTrailingSlash: false,
  })

  io.on("connection", (socket) => {
    socket.on("sendMessage", (message: Message, chatID, receiverIdentifier) => {
      socket
        .to(receiverIdentifier)
        .emit("receiveMessage", { ...message, is_me: false }, chatID)
      socket
        .to("admin_api_1")
        .emit("receiveMessage", { ...message, is_me: false }, chatID)
    })
    socket.on("deleteMessage", (chatID, messageID) => {
      socket.to(chatID).emit("deletedMessage", messageID)
    })

    socket.on("joinChat", (chatID) => {
      socket.join(chatID)
    })
    socket.on("setIdentifier", (identifier) => {
      console.log("🚀 ~ socket.on ~ identifier:", identifier)
      socket.join(identifier)
    })
    socket.on("removeIdentifier", (identifier) => {
      console.log("🚀 ~ socket.on ~ identifier:", identifier)
      socket.leave(identifier)
    })
    socket.on("leaveChat", (chatID) => {
      socket.leave(chatID)
    })
    socket.on("typing", (isTyping, chatID, receiverIdentifier) => {
      socket.to(receiverIdentifier).emit("typing", isTyping, chatID)
      socket.to("admin_api_1").emit("typing", isTyping, chatID)
    })
    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id)
    })
  })

  res.socket.server.io = io
  res.end()
  //   res.status(201).json({ success: true, message: "Socket is started", socket: `:${PORT + 1}` })
}
