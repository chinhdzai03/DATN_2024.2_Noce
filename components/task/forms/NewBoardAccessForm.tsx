'use client';
import {addEmailToBoard} from "@/actions/boardActions";
import {useRouter} from "next/navigation";
import {useRef} from "react";

export default function NewBoardAccess({boardId}:{boardId:string}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  async function addEmail(formData: FormData) {
    const email = formData.get('email')?.toString() || '';
    await addEmailToBoard(boardId, email);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    router.refresh();
  }
  return (
    <form action={addEmail} className="max-w-xs">
      <h2 className="text-lg mb-2 font-semibold">Add email</h2>
      <input ref={inputRef} type="text" placeholder="john@example.com" name="email" className="p-3 hover:outline"/>
      <button className="w-full mt-3 hover:text-white hover:bg-black" type="submit" >Save</button>
    </form>
  );
}