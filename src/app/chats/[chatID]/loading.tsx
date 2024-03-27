import React from "react"
import Image from "next/image"
import logo from "@/assets/logo.png"
import Loader from "@/components/ui/loader"

type Props = {}

const loading = (props: Props) => {
  return (
    <div className=" flex h-screen w-full items-center justify-center">
      <div>
        
        <Loader/>
      </div>
    </div>
  )
}

export default loading
