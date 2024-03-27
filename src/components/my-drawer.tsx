"use client"

import * as React from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useAppStore } from "@/stores/app-store-provider"
import { Avatar } from "@radix-ui/react-avatar"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { User } from "lucide-react"
import { useShallow } from "zustand/react/shallow"

import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer"

import { AvatarFallback, AvatarImage } from "./ui/avatar"
import Loader from "./ui/loader"

const filtersItems = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none">
        <path
          d="M22 5C22 6.65685 20.6569 8 19 8C17.3431 8 16 6.65685 16 5C16 3.34315 17.3431 2 19 2C20.6569 2 22 3.34315 22 5Z"
          fill="#494949"
        />
        <path
          opacity="0.5"
          d="M15.6361 2.01096C15.0111 2 14.3051 2 13.5 2H10.5C7.22657 2 5.58985 2 4.38751 2.7368C3.71473 3.14908 3.14908 3.71473 2.7368 4.38751C2 5.58985 2 7.22657 2 10.5V11.5C2 13.8297 2 14.9946 2.3806 15.9134C2.88807 17.1386 3.86144 18.1119 5.08658 18.6194C5.74689 18.8929 6.53422 18.9698 7.78958 18.9915C8.63992 19.0061 9.06509 19.0134 9.40279 19.2098C9.74049 19.4063 9.95073 19.7614 10.3712 20.4718L10.9133 21.3877C11.3965 22.204 12.6035 22.204 13.0867 21.3877L13.6288 20.4718C14.0492 19.7614 14.2595 19.4062 14.5972 19.2098C14.9349 19.0134 15.36 19.0061 16.2104 18.9915C17.4658 18.9698 18.2531 18.8929 18.9134 18.6194C20.1386 18.1119 21.1119 17.1386 21.6194 15.9134C22 14.9946 22 13.8297 22 11.5V10.5C22 9.69494 22 8.98889 21.989 8.36394C21.1942 9.07068 20.1473 9.5 19 9.5C16.5147 9.5 14.5 7.48528 14.5 5C14.5 3.85275 14.9293 2.80577 15.6361 2.01096Z"
          fill="#494949"
        />
      </svg>
    ),
    title: "المحادثات التي لم تقرأ بعد",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none">
        <path
          d="M19.5 8.25H15.915C15.5033 7.79325 14.9122 7.5 14.25 7.5H8.25V3.75C8.25 2.925 8.925 2.25 9.75 2.25H21.75C22.575 2.25 23.25 2.925 23.25 3.75V12C23.25 12.825 22.575 13.5 21.75 13.5H18.75L16.5 15.75V9.75H19.5C19.914 9.75 20.25 9.414 20.25 9C20.25 8.586 19.914 8.25 19.5 8.25ZM19.5 5.25H12C11.586 5.25 11.25 5.586 11.25 6C11.25 6.414 11.586 6.75 12 6.75H19.5C19.914 6.75 20.25 6.414 20.25 6C20.25 5.586 19.914 5.25 19.5 5.25ZM2.25 8.25H14.25C15.075 8.25 15.75 8.925 15.75 9.75V18C15.75 18.825 15.075 19.5 14.25 19.5H10.5L8.25 21.75L6 19.5H2.25C1.425 19.5 0.75 18.825 0.75 18V9.75C0.75 8.925 1.425 8.25 2.25 8.25ZM4.5 15.75H12C12.414 15.75 12.75 15.414 12.75 15C12.75 14.586 12.414 14.25 12 14.25H4.5C4.086 14.25 3.75 14.586 3.75 15C3.75 15.414 4.086 15.75 4.5 15.75ZM4.5 12.75H12C12.414 12.75 12.75 12.414 12.75 12C12.75 11.586 12.414 11.25 12 11.25H4.5C4.086 11.25 3.75 11.586 3.75 12C3.75 12.414 4.086 12.75 4.5 12.75Z"
          fill="#494949"
        />
      </svg>
    ),
    title: "جميع المحادثات",
  },
]
const chatOptions = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none">
        <path
          d="M3.00003 11.9983C3.00041 10.0168 3.65467 8.09091 4.8613 6.51926C6.06794 4.9476 7.7595 3.81807 9.67359 3.30589C11.5877 2.7937 13.6173 2.92749 15.4476 3.6865C17.2779 4.44551 18.8065 5.78731 19.7964 7.50376C20.7863 9.2202 21.1821 11.2153 20.9224 13.1797C20.6627 15.144 19.762 16.9677 18.36 18.3679C16.958 19.7682 15.1332 20.6666 13.1685 20.9238C11.2039 21.1811 9.20923 20.7828 7.49403 19.7908L3.98703 20.9608C3.85746 21.004 3.71854 21.0111 3.58526 20.9812C3.45198 20.9512 3.3294 20.8855 3.23075 20.791C3.1321 20.6965 3.06112 20.5769 3.02549 20.445C2.98985 20.3132 2.9909 20.1741 3.02853 20.0428L4.09653 16.3063C3.37505 14.9851 2.99795 13.5036 3.00003 11.9983ZM8.84403 8.84226L8.75853 8.94726C8.65851 9.09156 8.61229 9.26638 8.62791 9.44125C8.64354 9.61613 8.72002 9.77998 8.84403 9.90426L10.9395 11.9983L8.84403 14.0923L8.75853 14.1973C8.65851 14.3416 8.61229 14.5164 8.62791 14.6913C8.64354 14.8661 8.72002 15.03 8.84403 15.1543L8.94903 15.2398C9.09333 15.3398 9.26814 15.386 9.44302 15.3704C9.61789 15.3548 9.78175 15.2783 9.90603 15.1543L12 13.0588L14.094 15.1543L14.199 15.2398C14.3433 15.3398 14.5181 15.386 14.693 15.3704C14.8679 15.3548 15.0317 15.2783 15.156 15.1543L15.2415 15.0493C15.3415 14.905 15.3878 14.7302 15.3721 14.5553C15.3565 14.3804 15.28 14.2165 15.156 14.0923L13.0605 11.9983L15.156 9.90426L15.2415 9.79926C15.3415 9.65497 15.3878 9.48015 15.3721 9.30528C15.3565 9.1304 15.28 8.96655 15.156 8.84226L15.051 8.75677C14.9067 8.65675 14.7319 8.61052 14.557 8.62615C14.3822 8.64177 14.2183 8.71825 14.094 8.84226L12 10.9378L9.90603 8.84226L9.80103 8.75677C9.65673 8.65675 9.48192 8.61052 9.30704 8.62615C9.13217 8.64177 8.96831 8.71825 8.84403 8.84226Z"
          fill="#494949"
        />
      </svg>
    ),
    title: "الغاء المحادثة",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none">
        <path
          d="M22.8785 20.8079V24H1.12146V20.8072C1.12146 19.2999 2.42098 17.4442 4.0085 16.6902L7.54104 15.0119L9.99325 20.122L11.2488 16.7179C11.4963 16.7647 11.7418 16.8271 12 16.8271C12.2582 16.8271 12.5029 16.7647 12.7512 16.7179L13.9429 19.9546L16.3469 14.9551L19.9936 16.6895C21.579 17.4435 22.8785 19.2992 22.8785 20.8079ZM4.33054 9.62014V7.31477C4.33054 6.92392 4.53412 6.58131 4.84127 6.38411C5.2534 2.79624 8.305 0 12.0014 0C15.6978 0 18.7501 2.79624 19.163 6.38411C19.4694 6.58131 19.673 6.92392 19.673 7.31477V9.62014C19.673 10.2323 19.1771 10.7289 18.5643 10.7289C17.9514 10.7289 17.4556 10.2323 17.4556 9.62014V9.13566C16.8555 12.1539 14.6458 14.9558 12.0021 14.9558C9.35838 14.9558 7.14877 12.1539 6.54866 9.13566V9.62014C6.54866 10.1167 6.21882 10.5324 5.76838 10.6735C6.2096 12.1752 7.18849 13.4726 8.5405 14.3238C8.79019 14.2415 9.10514 14.2571 9.41087 14.416C9.90174 14.6714 10.1521 15.1679 9.96629 15.5226C9.78115 15.8773 9.23354 15.9567 8.73983 15.7007C8.37948 15.5127 8.15107 15.197 8.12696 14.9019C6.57845 13.9117 5.48039 12.3958 5.02712 10.6473C4.61995 10.4841 4.33054 10.0869 4.33054 9.62014ZM5.59672 6.1252C5.63006 6.12733 5.66198 6.12804 5.6939 6.1401C5.77406 6.16989 5.83222 6.22734 5.87266 6.29473C6.11313 6.39688 6.30465 6.58344 6.4224 6.81468C6.74941 3.7496 9.11862 2.12804 12 2.12804C14.8813 2.12804 17.2506 3.7496 17.5776 6.81468C17.74 6.49619 18.0486 6.26849 18.4181 6.22096C17.9386 3.10481 15.2474 0.708636 12 0.708636C8.78594 0.709346 6.11596 3.05657 5.59672 6.1252Z"
          fill="#494949"
        />
      </svg>
    ),
    title: "التحدث الي احد ممثلين خدمة العملاء",
  },
]

export function MyDrawer() {
  const [drawer, setDrawerState] = useAppStore(
    useShallow((state) => [state.drawer, state.setDrawer]),
  )

  return (
    <Drawer
      open={!!drawer.type}
      onClose={() => setDrawerState({ type: "", payload: "" })}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm pt-5">
          {drawer.type === "filters" ? (
            <div className="mb-4 space-y-2">
              {filtersItems.map((e, i) => {
                return (
                  <button
                    key={`filter_item_${i}`}
                    type="button"
                    className="flex  w-full gap-2 rounded-lg bg-[#F8F8F8] px-[10px] py-3"
                    title="unread chats">
                    {e.icon}
                    <span className="font-bold text-secondaryColor">{e.title}</span>
                  </button>
                )
              })}
            </div>
          ) : null}
          {drawer.type === "chat-options" ? (
            <div className="mb-4 space-y-2">
              {chatOptions.map((e, i) => {
                return (
                  <button
                    key={`filter_item_${i}`}
                    type="button"
                    className="flex  w-full gap-2 rounded-lg bg-[#F8F8F8] px-[10px] py-3"
                    title="unread chats">
                    {e.icon}
                    <span className="font-bold text-secondaryColor">{e.title}</span>
                  </button>
                )
              })}
            </div>
          ) : null}
          {drawer.type === "reviews" ? (
            <Reviews
              user_guard={drawer.payload.user_guard}
              user_id={drawer.payload.user_id}
            />
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function Reviews({ user_guard, user_id }: { user_guard: string; user_id: number }) {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const { data, isLoading, error } = useQuery({
    queryKey: ["reviews", user_guard, user_id],
    queryFn: async () => {
      const response = await axios.get<{
        data: {
          reviews: {
            name: string
            avatar: string
            stars: number
            comment: string
            date: string
          }[]
        }
      }>(`/api/user/${user_guard}/${user_id}/reviews?token=${token}`)
      return response.data
    },
  })

  if (isLoading)
    return (
      <div className=" h-[90vh] px-3 py-5">
        <Loader className={"py-10"} />
      </div>
    )
  if (error)
    return (
      <div className=" h-[90vh] px-3 py-5">
        <p className="text-red-500">عذرا لم نتمكن من عرض تقييمات المستخدمين</p>
      </div>
    )
  if (data && data.data?.reviews?.length === 0)
    return (
      <div className="h-[90vh] px-3 ">
        <p>لا يوجد تقيميات</p>
      </div>
    )
  return (
    <div className="h-[90vh] ">
      <DrawerHeader className="text-lg font-bold">تقييمات المستخدمين</DrawerHeader>
      <div className=" space-y-3">
        {data?.data?.reviews?.map((review, index) => {
          return (
            <div
              key={index}
              className={
                " relative flex   gap-4 border-b border-t bg-white px-1 py-4 duration-200"
              }>
              <Avatar className=" relative aspect-square h-9 w-9 shrink-0">
                <AvatarImage src={review.avatar} />
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-[14px] font-bold leading-loose text-secondaryColor">
                  {review.name}
                </p>
                <span
                  className={
                    "block  text-sm font-semibold leading-loose text-[#7B7B7B]"
                  }>
                  {review.comment}
                </span>
              </div>
              <div className=" mr-auto">
                <p>
                  التقييم
                  <span className="px-3 text-lg font-bold text-primary">
                    {review.stars}
                  </span>
                </p>
                <span className="block text-sm leading-loose text-[#494949] ">
                  {review.date}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
