import Boards from "@/components/task/Boards";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRight} from "@fortawesome/free-solid-svg-icons";


export default function Task () {
    return (
        <main>
            {/* <p>Task</p> */}
            <h1 className="text-4xl mb-4">Your boards</h1>
            <Boards/>
            <div className="mt-4">
                <Link
                className="btn primary inline-flex gap-2"
                href={'/task/new-board'}>
                Create new board <FontAwesomeIcon className="h-6" icon={faArrowRight}/>
                </Link>
            </div>
        </main>
    )
}