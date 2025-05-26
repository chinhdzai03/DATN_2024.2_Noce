'use client';
import {useUpdateMyPresence} from "@/app/task/liveblocks.config";
import CardModalBody from "@/components/task/CardModalBody";
import {useParams, useRouter} from "next/navigation";
// import "@liveblocks/react-comments/styles.css";
import {useEffect} from "react";

export default function CardModal() {

  const router = useRouter();
  const params = useParams();
  const updateMyPresence = useUpdateMyPresence();

  function handleBackdropClick() {
    router.back();
  }

  useEffect(() => {
    if (params.cardId) {
      updateMyPresence({cardId: params.cardId.toString()});
    }
  }, [params]);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 z-40 transition-opacity duration-200"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={handleBackdropClick}>
        <div className="w-full max-w-xl px-2 sm:px-0">
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 relative" onClick={ev => ev.stopPropagation()}>
            <CardModalBody/>
          </div>
        </div>
      </div>
    </>
  );
}