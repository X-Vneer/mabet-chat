export type ChatListsResponse = {
  data: Data
  message: null
  success: boolean
}

export type Data = {
  statics: Statics
  chats: Chat[]
  from: number
  to: number
  total: number
  per_page: number
  current_page: number
  last_page: number
  next_page_url: null
  previous_page_url: null
}

export type Chat = {
  uuid: string
  chat_name: string
  last_message: string
  is_read: boolean
  unread_messages: number
  user_guard: string
  user_id: number
  chat_image: string
  created_at: Date
  last_message_at: string
  last_message_day: string
  chat_link: string
  access_token: string
  is_user_online: null | boolean
  user_identifier: string
}

export type Statics = {
  response_rate: string
  response_duration: string
}
