import './task.css';

export default function TaskLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <div className="flex-1 pl-4 pr-4 bg-gray-100 overflow-y-auto ">
                {children}
            </div>
        </div>
    );

}
