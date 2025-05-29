import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SignedIn , SignedOut } from "@clerk/nextjs";


export default function Home() {
  return (
    <main className="flex flex-col space-x-2 items-center animate-pulse justify-center h-screen pb-40">
      {/* <ArrowLeftCircle className="w-12 h-12"/> */}
      <h1 className="font-bold text-[32px] text-center z-10">
          Welcome to Noce
      </h1>
      <p className="text-gray-500 text-center text-[20px] z-10">
        Your all-in-one solution for productivity and collaboration.
      </p>
      <div className="absolute bottom-0 left-0 w-[35%] h-auto z-0 animate-slide-in-left">
        <img src="/img/a2.jpg" alt="img2" className="w-full h-full object-cover" />
      </div>
      <div className="absolute bottom-0 right-0 w-[35%] h-auto z-0 animate-slide-in-right">
        <img src="/img/a1.jpg" alt="img1" className="w-full h-full object-cover" />
        
      </div>
      <SignedOut>
        <Link href="/sign-in" className="underline">
          <div className="flex items-center gap-2 pt-4"> 
            <div className="text-[18px] ">
            Get Start
          </div>
          <ArrowRight className="w-6 h-6"/>
        </div>
      </Link>
      </SignedOut>
    </main>
  );
}
