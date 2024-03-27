import ChatApi from "@/api"
import axios from "axios"

export async function GET(
  req: Request,
  { params }: { params: { user_guard: string; user_id: string } },
) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")
    if (!token) return new Response("Unauthorized", { status: 401 })
    const { user_guard, user_id } = params
    const response = await ChatApi.get(`/chats/${user_id}/${user_guard}/reviews`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return Response.json(response.data)
  } catch (error) {
    console.log("🚀 ~ error:", error)
    if (axios.isAxiosError(error)) {
      return new Response(JSON.stringify(error.response?.data), {
        status: error.response?.status,
      })
    }
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 })
    }

    return new Response("Internal server error", { status: 500 })
  }
}
