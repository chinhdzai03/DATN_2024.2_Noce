'use client';
import {Card, useMutation} from "@/app/task/liveblocks.config";
import {LiveObject} from "@liveblocks/core";
import {FormEvent, useState} from "react";
import uniqid from "uniqid";

export default function NewCardForm({columnId}: {columnId: string}) {

  const [value, setValue] = useState("");
  const addCard = useMutation(({storage}, cardName) => {
    return storage.get('cards').push(new LiveObject<Card>({
      name: cardName,
      id: uniqid.time(),
      columnId: columnId,
      index: 9999,
    }))
  }, [columnId]);

  function handleNewCardFormSubmit(ev: FormEvent) {
    ev.preventDefault();
    const content = value.trim();
    if (content.length === 0) return;
    addCard(content);
    setValue("");
  }

  return (
    <form onSubmit={handleNewCardFormSubmit} className="flex flex-col gap-2 mt-2">
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Add new card"
        className="bg-white text-black px-2 py-1 focus:outline-none rounded resize-none min-h-[40px] focus:scale-105 transition-all" 
        rows={2}
      />
      <button
        type="submit"
        className="bg-black text-white px-4 py-2 rounded-xl mt-1 hover:bg-gray-900 transition hover:text-white"
        disabled={value.trim().length === 0}
      >
        Add Card
      </button>
    </form>
  );
}