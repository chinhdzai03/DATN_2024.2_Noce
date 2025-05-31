import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Noce's Calendar ",
  description: "Making Scheduling possible",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <html lang="en">
    //   <body
    //     className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    //   >
    //     {children}
    //   </body>
    // </html>
    <div className="bg-white overflow-auto">
      {children}
    </div>
  );
}
