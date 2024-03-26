import axios from "axios"

import { UserResponse } from "@/types/user"

import { baseURL } from "./base-url"

export const getMe = async ({ token }: { token: string }) => {
  const response = await axios.get<UserResponse>(`${baseURL}/api/me?token=${token}`)

  return response.data
}
