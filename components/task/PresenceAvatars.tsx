'use client';
import {Presence, useOthers} from "@/app/task/liveblocks.config";
import {shallow} from "@liveblocks/core";
import { Avatar , AvatarImage } from "../ui/avatar";
type Props = {
  presenceKey: keyof Presence;
  presenceValue: string;
};

export default function PresenceAvatars({
  presenceKey, presenceValue
}: Props) {

  const others = useOthers(users => {
    return users.filter(u => u.presence?.[presenceKey] === presenceValue);
  }, shallow);

  // const others = useOthers();

  return (
    <div className="flex gap-1">
      {others.map(user => (
        <div key={user.id}>
          <img
            className="size-8 rounded-full"
            src={user.info.avatar} alt="avatar"/>
        </div>
        
      ))}
    </div>
  );
}