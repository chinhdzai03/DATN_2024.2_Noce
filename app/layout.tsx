// "use client"
import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Notion/Header";
import Sidebar from "@/components/Notion/Sidebar";
import { Toaster } from "@/components/ui/sonner";
// import { usePathname } from "next/navigation";


export const metadata: Metadata = {
  title: "Noce",
  description: "Welcome to Noce, your all-in-one solution.",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (

    <ClerkProvider>
      <html lang="en">
        <body>
          <Header />
          <div className="flex min-h-screen">
            
            {/* <Sidebar/> */}

            <div className="flex-1 p-4 bg-gray-100 overflow-y-auto ">
              {children}  
            </div>
          </div>

          <Toaster position="top-center"/>

        </body>
      </html>
    </ClerkProvider>

  );
}
