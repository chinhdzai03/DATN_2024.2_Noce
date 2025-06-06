'use client';
import {Column, useMutation, useStorage} from "@/app/task/liveblocks.config";
import NewColumnForm from "@/components/task/forms/NewColumnForm";
import {LiveList, LiveObject, shallow} from "@liveblocks/core";
import {ReactSortable} from "react-sortablejs";
import {default as BoardColumn} from '@/components/task/Column';

export default function Columns({ searchTerm = "" }) {
  const columns = useStorage(root => root.columns?.map(c => ({...c})) ?? [], shallow);
  const cards = useStorage(root => root.cards?.map(c => ({...c})) ?? [], shallow);

  const filteredColumns = searchTerm.trim() === ""
    ? columns || []
    : (columns || []).filter(col =>
        (cards || []).some(card =>
          card.columnId === col.id &&
          card.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

  const updateColumns = useMutation(({storage}, columns:LiveObject<Column>[]) => {
    storage.set('columns', new LiveList(columns));
  }, []);

  function setColumnsOrder(sortedColumns: Column[]) {
    const newColumns:LiveObject<Column>[] = [];
    sortedColumns.forEach((sortedColumn, newIndex) => {
      const newSortedColumn = {...sortedColumn};
      newSortedColumn.index = newIndex;
      newColumns.push(new LiveObject(newSortedColumn));
    });
    updateColumns(newColumns);
  }

  if (!columns) {
    return;
  }

  return (
    <div className="flex gap-8 px-4 py-2 overflow-x-auto items-start">
      <ReactSortable
        group={'board-column'}
        list={filteredColumns}
        className="flex gap-8"
        ghostClass="opacity-40"
        setList={setColumnsOrder}>
        {filteredColumns.length > 0 && filteredColumns.map(column => (
          <BoardColumn
            key={column.id}
            {...column}
          />
        ))}
      </ReactSortable>
      <NewColumnForm/>
    </div>
  );
}