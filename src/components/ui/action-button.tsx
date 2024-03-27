"use client"

import React from "react"
import { useAppStore } from "@/stores/app-store-provider"
import { MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

type Props = {
  action: { type: string; payload: any }
}

const ActionButton = ({ action }: Props) => {
  const setDrawer = useAppStore((state) => state.setDrawer)
  const handleAction = () => {
    setDrawer(action)
  }
  return (
    <button
      onClick={handleAction}
      className=" flex aspect-square w-8 items-center justify-center rounded-lg bg-primary"
      type="button"
      title="settings">
      <MoreHorizontal className={cn("text-white")} />
    </button>
  )
}

export default ActionButton
