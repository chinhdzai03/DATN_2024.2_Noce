'use client'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { FormEvent, useState, useTransition } from "react"
import { Button } from "../ui/button"
import { usePathname, useRouter } from "next/navigation";
import { deleteDocument, InviteUserToDocument } from "@/actions/actions";
import { toast } from "sonner";
import { Input } from "../ui/input";

function InviteUser() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();
    const router = useRouter();
    const [email , setEmail] = useState('');

    const handleInvite = async ( e : FormEvent) => {
        e.preventDefault();

        const roomId = pathname.split("/").pop();
        if(!roomId) return;
        
        startTransition( async () => {
            const {success} = await InviteUserToDocument(roomId , email);
            
            if(success) {
                setIsOpen(false);
                setEmail('');
                toast.success("User Added successfully");
            } 
            else {
                toast.error("Failed to add user room");
            }

        })
    }
  return (
    <div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button asChild variant="outline">
                <DialogTrigger>Invite</DialogTrigger>
            </Button>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Invite user to room</DialogTitle>
                
                </DialogHeader>

                

            <form className="flex gap-2" onSubmit={handleInvite}>
                <Input
                type="email"
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" disabled={!email ||isPending}>{isPending ? "Inviting..." : "Invite"}</Button>

            </form>
            </DialogContent>
        </Dialog>
    </div>
  )
}

export default InviteUser
