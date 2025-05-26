import './task.css';
import "@liveblocks/react-ui/styles.css";

export default function TaskLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <div className="flex-1   overflow-y-auto ">
                {children}
            </div>
        </div>
    );

}
