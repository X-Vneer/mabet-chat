import React from "react"
import Image from "next/image"
import logo from "@/assets/logo.png"

type Props = {}

const loading = (props: Props) => {
  return (
    <div className=" flex h-screen w-full items-center justify-center">
      <div>
        <Image src={logo} alt="logo" className="block w-20 animate-pulse" />
        <span className="block text-center text-xl font-bold text-[#ccc]">مبيت</span>
      </div>
    </div>
  )
}

export default loading
