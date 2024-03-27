import ChatApi from "@/api"

import { ChatListsResponse } from "@/types/chat-list-response"
import { UserResponse } from "@/types/user"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")
    if (!token) return new Response("Unauthorized", { status: 401 })
    const response = await ChatApi.get<UserResponse>(`/account/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return Response.json(response.data)
  } catch (error) {
    console.log("🚀 ~ GET ~ error:", error)
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 })
    }

    return new Response("Internal server error", { status: 500 })
  }
}
