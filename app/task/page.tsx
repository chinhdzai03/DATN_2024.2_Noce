// 'use client'
import Boards from "@/components/task/Boards";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRight} from "@fortawesome/free-solid-svg-icons";
// import { useUser } from "@clerk/nextjs";
import { SquareKanban } from "lucide-react";

export default function Task () {
    // const { user } = useUser();

    return (
        <main className="ml-4">
            {/* <p>Task</p> */}
            <h1 className="text-4xl mb-4 font-semibold flex flex-1 items-center gap-3">
                <SquareKanban size={32}/>
                Your boards
            </h1>
            <Boards/>
            <div className="mt-4">
                <Link
                className="btn bg-black text-white inline-flex gap-2 hover:bg-black hover:text-white "
                href={'/task/new-board'}>
                Create new board <FontAwesomeIcon className="h-6" icon={faArrowRight}/>
                </Link>
            </div>
        </main>
    )
}