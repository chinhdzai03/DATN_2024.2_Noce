import { getEventsData } from "@/components/getEventsData";
import { auth } from "@clerk/nextjs/server"; // hoặc xác thực token tuỳ hệ thống
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { sessionClaims } = await auth();
    const email = sessionClaims?.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await getEventsData(email);
    return NextResponse.json(events);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}