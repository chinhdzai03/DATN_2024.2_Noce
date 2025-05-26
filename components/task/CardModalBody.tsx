import {Card, useMutation, useStorage, useThreads} from "@/app/task/liveblocks.config";
import {BoardContext, BoardContextProps} from "@/components/task/BoardContext";
import CancelButton from "@/components/task/CancelButton";
import CardDescription from "@/components/task/CardDescription";
import DeleteWithConfirmation from "@/components/task/DeleteWithConfirmation";
import {faComments, faFileLines} from "@fortawesome/free-regular-svg-icons";
import {faEllipsis} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {shallow} from "@liveblocks/core";
import {Composer, Thread} from "@liveblocks/react-ui";
import {useParams, useRouter} from "next/navigation";
import {FormEvent, useContext, useEffect, useState} from "react";

export default function CardModalBody() {

  const router = useRouter();
  const params = useParams();
  const { threads } = useThreads({
    query: {
      metadata:{
        cardId: params.cardId.toString(),
      }
    }
  });
  const {setOpenCard} = useContext<BoardContextProps>(BoardContext);
  const [editMode, setEditMode] = useState(false);

  const card = useStorage(root => {
    return root.cards.find(c => c.id === params.cardId);
  }, shallow);

  const updateCard = useMutation(({storage}, cardId, updateData) => {
    const cards = storage.get('cards').map(c => c.toObject());
    const index = cards.findIndex(c => c.id === cardId);
    const card = storage.get('cards').get(index);
    for (let updateKey in updateData) {
      card?.set(updateKey as keyof Card, updateData[updateKey]);
    }
  }, []);

  const deleteCard = useMutation(({storage}, id) => {
    const cards = storage.get('cards');
    const cardIndex = cards.findIndex(c => c.toObject().id === id);
    cards.delete(cardIndex);
  }, []);

  useEffect(() => {
    if (params.cardId && setOpenCard) {
      setOpenCard(params.cardId.toString());
    }
  }, [params]);

  function handleDelete() {
    deleteCard(params.cardId);
    if (setOpenCard) {
      setOpenCard(null);
    }
    router.back();
  }

  function handleNameChangeSubmit(ev: FormEvent) {
    ev.preventDefault();
    const input = (ev.target as HTMLFormElement).querySelector('input');
    if (input) {
      const newName = input.value;
      updateCard(params.cardId, {name:newName});
      setEditMode(false);
    }
  }

  return (
    <>
      {!editMode && (
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-3xl font-bold text-black truncate max-w-[70%]">{card?.name}</h4>
          <button className="text-gray-400 hover:text-black p-2 rounded-full transition-colors" onClick={() => setEditMode(true)}>
            <FontAwesomeIcon icon={faEllipsis} size="lg"/>
          </button>
        </div>
      )}
      {editMode && (
        <div className="mb-6">
          <form onSubmit={handleNameChangeSubmit} className="flex flex-col gap-3">
            <input type="text" defaultValue={card?.name} className="mb-2 px-4 py-2 rounded-xl border border-gray-300 focus:border-black focus:ring-2 focus:ring-black/20 outline-none text-lg font-semibold"/>
            <button type="submit" className="w-full bg-black text-white rounded-xl py-2 font-bold hover:bg-gray-900 transition">Save</button>
          </form>
          <div className="mt-3 flex gap-2">
            <DeleteWithConfirmation onDelete={() => handleDelete()} />
            <CancelButton onClick={() => setEditMode(false)} />
          </div>
        </div>
      )}
      {!editMode && (
        <div>
          <h2 className="flex gap-2 items-center mt-2 mb-2 text-lg font-semibold text-black">
            <FontAwesomeIcon icon={faFileLines} className="text-black/70"/>
            Description
          </h2>
          <div className="mb-6">
            <CardDescription/>
          </div>
          <h2 className="flex gap-2 items-center mt-2 mb-2 text-lg font-semibold text-black">
            <FontAwesomeIcon icon={faComments} className="text-black/70"/>
            Comments
          </h2>
          <div className="flex flex-col gap-8">
            {threads && threads.map(thread => (
              
                <Thread key={thread.id}
                  thread={thread} 
                  id={thread.id}
                  showComposer={true}
                  showActions="hover"
                  showReactions={true}
                  showAttachments={true}
                  showComposerFormattingControls={true}
                  overrides={{
                    THREAD_COMPOSER_PLACEHOLDER: "Write comments ...",
                    THREAD_COMPOSER_SEND: "Gửi",
                  }}
                />
              
            ))}
            {threads?.length === 0 && (
              
                <Composer 
                  metadata={{cardId: params.cardId.toString()}}
                  showAttachments={true}
                  showFormattingControls={true}
                  overrides={{
                    COMPOSER_PLACEHOLDER: "Write comments ...",
                    COMPOSER_SEND: "Gửi",
                  }}
                />
              
            )}
          </div>
        </div>
      )}
    </>
  );
}