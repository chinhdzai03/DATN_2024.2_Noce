import {useRoom} from "@/app/task/liveblocks.config";
import DescriptionEditor from "@/components/task/DescriptionEditor";
// import {LiveblocksProvider} from "@liveblocks/yjs";
import {LiveblocksYjsProvider} from '@liveblocks/yjs'

import {useParams} from "next/navigation";
import {useEffect, useState} from "react";
import {Doc} from "yjs";

export default function CardDescription() {
  const {cardId} = useParams();
  const room = useRoom();

  const [doc, setDoc] = useState<Doc|null>(null);
  const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);

  useEffect(() => {
    const yDoc = new Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);

    setDoc(yDoc);
    setProvider(yProvider);

    return () => {
      yDoc.destroy();
      yProvider.destroy();
    };

  }, [room]);

  if (!doc || !provider) {
    return null;
  }

  return (
    <div>
      <DescriptionEditor
        doc={doc}
        provider={provider}
        cardId={cardId.toString()}
      />
    </div>
  );
}