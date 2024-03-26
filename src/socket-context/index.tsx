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
    let cancel = false
    ;(async () => {
      // await fetch("/api/socket", { signal })
      // const response = await fetch("/api/socket", { signal })
      // // @ts-expect-error
      // const socket = io(undefined, {
      //   path: "/api/socket.io",
      // })
      const socket = io("https://chat-app.mabet.com.sa:443")
      if (!cancel) {
        socket.on("connect", () => {
          console.log("connected")
          // @ts-ignore
          setSocket(socket)
        })
        socket.on("disconnect", () => console.log("disconnected"))
      }
    })()
    return () => {
      cancel = true
    }
  }, [])
  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}

export const useSocket = () => {
  const socketContext = useContext(SocketContext)

  return socketContext
}
