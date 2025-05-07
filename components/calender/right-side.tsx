"use client";


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useViewStore } from "@/lib/store";
import { Button } from "../ui/button";
import { Calendar , File } from "lucide-react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs'


export default function HeaderRight() {

  const { setView } = useViewStore();

  const  router  = useRouter();

  return (
    <div className="flex items-center space-x-4">
      {/* <Button className='  ' onClick={() => router.push("/")} >
            <File className='mr-2'/>
            Document
        </Button> */}
    {/* <SearchComponent /> */}
    <Select onValueChange={(v) => setView(v)}>
      <SelectTrigger className="w-24 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0">
        <SelectValue placeholder="Month" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="month">Month</SelectItem>
        <SelectItem value="week">Week</SelectItem>
        <SelectItem value="day">Day</SelectItem>
      </SelectContent>
    </Select>

    {/* <Avatar>
      <AvatarImage src="/img/inst2.png" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar> */}
    {/* <div>
            <SignedOut>
                <SignInButton/>
            </SignedOut>
    
            <SignedIn>
                <UserButton/>
            </SignedIn>
    </div> */}
  </div>
  )
}
