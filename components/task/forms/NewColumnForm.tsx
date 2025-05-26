'use client';

import {useMutation} from "@/app/task/liveblocks.config";
import {LiveObject} from "@liveblocks/core";
import {FormEvent} from "react";
import uniqid from "uniqid";


export default function NewColumnForm() {

  const addColumn = useMutation(({storage}, columnName) => {
    return storage.get('columns').push(new LiveObject({
      name: columnName,
      id: uniqid.time(),
      index: 9999,
    }));
  }, []);

  function handleNewColumn(ev: FormEvent) {
    ev.preventDefault();
    const input = (ev.target as HTMLFormElement).querySelector('input');
    if (input) {
      const columnName = input?.value;
      addColumn(columnName);
      input.value = '';
    }
  }
  return (
    <form onSubmit={handleNewColumn} className="flex flex-col gap-2 mt-2 shadow-lg rounded-xl p-4 hover:scale-110 transition-all min-w-fit ">
      <input
        type="text"
        placeholder="Add new column"
        className="bg-white text-black px-2 py-1 focus:outline-none rounded"
      />
      <button
        type="submit"
        className="bg-black text-white px-4 py-2 rounded-xl mt-1 hover:bg-gray-900 transition hover:text-white"
      >
        Add Column
      </button>
    </form>
  );
}