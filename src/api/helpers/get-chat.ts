import axios from "axios"

import { baseURL } from "./base-url"

export const getChat = async <T>({
  chatID,
  token,
}: {
  chatID: string
  token: string
}) => {
  const response = await axios.get<T>(
    `${baseURL}/api/chats/${chatID}?token=${token}`,
  )

  return response.data
}
