export type UserType = {
  name: string
  avatar: string
  id: number
}
export type UserResponse = {
  data: Data
  message: null
  success: boolean
}

export type Data = {
  user: DataUser
}

export type DataUser = {
  access_token: string
  user: UserUser
  token_type: string
  statics: Statics
  expires_in: null
}

export type UserUser = {
  id: number
  name: string
  email: string
  phonenumber: string
  user_guard: string
  user_identifier: string
  avatar: string
}

export type Statics = {
  response_rate: string
  rating: number
  out_of: number
  chat_count: number
  response_duration: string
}
