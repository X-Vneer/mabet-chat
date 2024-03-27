import ChatApi from "@/api"
import axios from "axios"

import { baseURL } from "./base-url"

export const getChatList = async <T>({
  token,
  query,
  pageParam,
  showReportedChats,
}: {
  token: string
  query?: string
  pageParam: string | number
  showReportedChats?: boolean
}) => {
  let url = `${baseURL}/api/chats-list?token=${token}&page=${pageParam}`

  console.log("🚀 ~ url:", url)
  if (query) url += `&query=${query}`
  if (showReportedChats) url += `&show_reported_chats=1`
  const response = await axios.get<T>(url)
  return response.data
}
