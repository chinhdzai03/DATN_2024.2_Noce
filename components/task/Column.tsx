import {Card, useMutation, useStorage} from "@/app/task/liveblocks.config";
import CancelButton from "@/components/task/CancelButton";
import {faClose, faEllipsis, faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {shallow} from "@liveblocks/core";
import {FormEvent, useState} from "react";
import {ReactSortable} from "react-sortablejs";
import NewCardForm from "@/components/task/forms/NewCardForm";
import {default as ColumnCard} from '@/components/task/Card';
import { HexColorPicker } from "react-colorful";

type ColumnProps = {
  id: string;
  name: string;
  color?: string;
};

export default function Column({id, name, color = '#FFFBDE'}: ColumnProps) {

  const [renameMode, setRenameMode] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const columnCards = useStorage<Card[]>(root => {
    return root.cards
      .filter(card => card.columnId === id)
      .map(c => ({...c}))
      .sort((a,b) => a.index - b.index);
  }, shallow);

  const updateCard = useMutation(({storage}, index, updateData) => {
    const card = storage.get('cards').get(index);
    if (card) {
      for (let key in updateData) {
        card?.set(key as keyof Card, updateData[key]);
      }
    }
  }, []);

  const updateColumn = useMutation(({storage}, id, newName) => {
    const columns = storage.get('columns');
    columns.find(c => c.toObject().id === id)?.set('name', newName);
  }, []);

  const updateColumnColor = useMutation(({storage}, id, newColor) => {
    const columns = storage.get('columns');
    columns.find(c => c.toObject().id === id)?.set('color', newColor);
  }, []);

  const deleteColumn = useMutation(({storage}, id) => {
    const columns = storage.get('columns');
    const columnIndex = columns.findIndex(c => c.toObject().id === id);
    columns.delete(columnIndex);
  }, [])

  const setTasksOrderForColumn = useMutation(({storage}, sortedCards:Card[], newColumnId) => {
    const idsOfSortedCards = sortedCards.map(c => c.id.toString());
    const allCards:Card[] = [...storage.get('cards').map(c => c.toObject())];
    idsOfSortedCards.forEach((sortedCardId, colIndex) => {
      const cardStorageIndex = allCards.findIndex(c => c.id.toString() === sortedCardId);
      updateCard(cardStorageIndex, {
        columnId: newColumnId,
        index: colIndex,
      });
    });
  }, []);

  function handleRenameSubmit(ev: FormEvent) {
    ev.preventDefault();
    const input = (ev.target as HTMLFormElement).querySelector('input');
    if (input) {
      const newColumnName = input.value;
      updateColumn(id, newColumnName);
      setRenameMode(false);
    }
  }

  return (
    <div className="w-96 rounded-2xl p-6 flex flex-col min-h-[200px] shadow-lg h-fit" style={{ backgroundColor: color }}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button
            className="w-6 h-6 rounded-full border-2 border-gray-300 mr-2"
            style={{ backgroundColor: color }}
            onClick={() => setColorPickerOpen(open => !open)}
            title="Change column color"
          />
          {!renameMode && (
            <h3 className="text-xl font-bold text-black">{name}</h3>
          )}
        </div>
        <button className="text-black hover:bg-gray-200 rounded-full p-2 transition" onClick={() => setRenameMode(true)}>
          <FontAwesomeIcon icon={faEllipsis} />
        </button>
      </div>
      {colorPickerOpen && (
        <div className="mb-2">
          <HexColorPicker color={color} onChange={c => updateColumnColor(id, c)} />
        </div>
      )}
      {renameMode && (
        <div className="mb-8">
          <span className="block mb-2 text-black font-semibold">Edit name:</span>
          <form onSubmit={handleRenameSubmit} className="mb-2 flex gap-2">
            <input type="text" defaultValue={name} className="border-b-2 border-black text-lg px-2 py-1 focus:outline-none focus:border-black bg-white text-black rounded w-full"/>
            <button type="submit" className="bg-black text-white px-4 py-1 rounded-lg">Save</button>
          </form>
          <button
            onClick={() => deleteColumn(id)}
            className="bg-red-500 text-white p-2 flex gap-2 w-full items-center rounded-md justify-center mt-2">
            <FontAwesomeIcon icon={faTrash} />
            Delete column
          </button>
          <CancelButton onClick={() => setRenameMode(false)} />
        </div>
      )}
      {!renameMode && columnCards && (
        <>
          <ReactSortable
            list={columnCards}
            setList={items => setTasksOrderForColumn(items, id)}
            group="cards"
            className="min-h-16"
            ghostClass="opacity-40"
          >
            {columnCards.map(card => (
              <ColumnCard key={card.id} id={card.id} name={card.name} />
            ))}
          </ReactSortable>
        </>
      )}
      {!renameMode && (
        <div className="mt-4">
          <NewCardForm columnId={id} />
        </div>
      )}
    </div>
  );
}