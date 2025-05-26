'use client';
import {createBoard} from "@/actions/boardActions";
import {redirect} from "next/navigation";

export default function NewBoardPage() {
  async function handleNewBoardSubmit(formData: FormData) {
    const boardName = formData.get('name')?.toString() || '';
    const roomInfo = await createBoard(boardName);
    if (roomInfo) {
      redirect(`/task/boards/${roomInfo.id}`);
    }
  }
  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-white">
      <form action={handleNewBoardSubmit} className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center">
        <h1 className="text-3xl mb-6 font-bold text-black">Create New Board</h1>
        <input
          type="text"
          name="name"
          placeholder="Board name"
          className="w-full mb-4 px-4 py-3 rounded-xl bg-white text-black border border-gray-300 focus:outline-none focus:border-black text-lg"
        />
        <button
          type="submit"
          className="w-full text-black py-3 rounded-xl text-lg font-semibold hover:bg-gray-900 transition mt-2 shadow hover:text-white"
        >
          Create Board
        </button>
      </form>
    </div>
  );
}