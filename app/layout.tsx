import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Notion/Header";
import Sidebar from "@/components/Notion/Sidebar";
import { Toaster } from "@/components/ui/sonner";


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
        <body className=" bg-white overflow-auto" >
          <Header />
          <div className="flex-1">
            
            {/* <Sidebar/> */}

            <div className="pt-4 bg-white overflow-y-auto ">
              {children}  
            </div>
          </div>

          <Toaster position="top-center"/>

        </body>
      </html>
    </ClerkProvider>

  );
}
