import { createClient } from "@liveblocks/client";
import {LiveList, LiveObject} from "@liveblocks/core";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  authEndpoint: "/api/auth-task",
  throttle: 100,
});


export type Presence = {
  boardId?: null|string;
  cardId?: null|string;
};

export type Column = {
  name: string;
  id: string;
  index: number;
  color?: string;
};

export type Card = {
  name: string;
  id: string;
  index: number;
  columnId: string;
  completed: boolean;
};

type Storage = {
  columns: LiveList<LiveObject<Column>>;
  cards: LiveList<LiveObject<Card>>;
};

type UserMeta = {
  id: string;
  info: {
    name: string;
    email: string;
    avatar: string;
  },
}

type RoomEvent = {};

type ThreadMetadata = {
  cardId: string;
};

    
export const {
  RoomProvider,
  useMyPresence,
  useUpdateMyPresence,
  useStorage,
  useMutation,
  useRoom,
  useSelf,
  useOthers,
  useThreads,
} = createRoomContext<
  Presence,
  Storage,
  UserMeta,
  RoomEvent,
  ThreadMetadata
>(client);