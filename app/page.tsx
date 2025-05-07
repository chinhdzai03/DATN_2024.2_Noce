import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle } from "lucide-react";

export default function Home() {
  return (
    <main className="flex space-x-2 items-center animate-pulse justify-center h-screen">
      {/* <ArrowLeftCircle className="w-12 h-12"/> */}
      <h1 className="font-bold text-[32px] text-center">
          Welcome to Noce
      </h1>
    </main>
  );
}
