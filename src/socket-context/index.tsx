"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { type Socket } from "socket.io"
import io from "socket.io-client"

export const SocketContext = createContext<Socket | null>(null)

export interface SocketProvider {
  children: ReactNode
}

export const SocketProvider = ({ children }: SocketProvider) => {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    ;(async () => {
      const response = await fetch(
        "https://xvneer-mabet-chat.netlify.app/api/socket",
        { signal },
      )
      console.log("🚀 ~ ; ~ response:", response)

      const socket = io()
      socket.on("connect", () => {
        console.log("connected")
        // @ts-ignore
        setSocket(socket)
      })
      socket.on("disconnect", () => console.log("disconnected"))
    })()
    return () => {
      controller.abort()
    }
  }, [])
  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}

export const useSocket = () => {
  const socketContext = useContext(SocketContext)

  return socketContext
}
