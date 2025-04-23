'use server'

import { db } from "@/db/drizzle";
import { eventsTable } from "@/db/schema";
import { revalidatePath } from "next/cache";


export async function createEvent(formData:  FormData): Promise<{ error: string } | { success: boolean } > {
    const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const date = formData.get('date') as string;
  const time = formData.get('time') as string;


  if (!title || !description || !date || !time) {
    return { error: 'All fields are required' };
  }

  const dateTime = new Date(`${date}T${time}:00`);

  try {
    await db.insert(eventsTable).values({
        title,
        description,
        date: dateTime,
      });

      // Revalidate the path and return a success response  
    revalidatePath("/");

    return { success: true };  // Return success instead of revalidatePath directly
    
  } catch (error) {
    console.error('Error creating event:', error);
    return { error: 'Failed to create event' };
  }
}