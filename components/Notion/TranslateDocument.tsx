import React, { FormEvent, useState, useTransition } from 'react'
import * as Y from 'yjs'
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
import { Button } from '../ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { BotIcon, LanguagesIcon } from 'lucide-react';
import { toast } from 'sonner';
import Markdown from 'react-markdown'

  

type Language = 
 | "english"
 | "spanish"
 | "french"
 | "german"
 | "italian"
 | "japanese"
 | "portuguese"
 | "russian"
 | "chinese"
 | "korean"
 | "vietnamese";

const Languages : Language[] = ["english", "spanish", "french", "german", "italian", "japanese", "portuguese", "russian", "chinese", "korean" , "vietnamese"];


function TranslateDocument({doc} : {doc : Y.Doc}) {
    const [isOpen , setIsOpen] = useState(false);
    const [language , setLanguage] = useState<string>("");
    const [sumamry , setSumamry] = useState("");
    const [question , setQuestion] = useState("");
    const [isPending , startTransition] = useTransition();


    const handleAskQuestion = async (e : FormEvent) => {
        e.preventDefault();

        startTransition( async () => {
            
            const documentData = doc.get("document-store").toJSON();

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/translateDocument`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        documentData,
                        targetLang: language,
                    }),
                }
            )
            if(res.ok) {
                const {translated_text} = await res.json();
                setSumamry(translated_text)
                toast.success("Translation successful")
            }
        })

    }


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <Button asChild variant="outline">
        <DialogTrigger>
            <LanguagesIcon />
            Translate
        </DialogTrigger>
    </Button>
    <DialogContent>
        <DialogHeader>
        <DialogTitle>Translate the Document</DialogTitle>
        <DialogDescription>
            Select a language to translate the document
        </DialogDescription>

        <hr className='mt-5' />

        {question && <p className='mt-5 text-gray-500'>Q : {question}</p>}
        </DialogHeader>

    {sumamry && (
        <div className='flex flex-col items-start max-h-96 overflow-y-scroll  gap-2 p-5 bg-gray-100'>
            <div className='flex'>
                <BotIcon className='w-10 flex-shrink-0' />
                <p className='font-bold'>
                    GPT {isPending ? "is thinking..." : "Says"}
                </p>
            </div>
            <p>{isPending ? "Thinking..." : <Markdown>{sumamry}</Markdown>}</p>
        </div>
    )}
        

    <form className="flex gap-2" onSubmit={handleAskQuestion}>
        <Select
            value={language}
            onValueChange={(value) => setLanguage(value)}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a language" />
            </SelectTrigger>

            <SelectContent>
                {Languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </SelectItem>
                ))}
            </SelectContent>
            
        </Select>

        <Button type="submit" disabled={!language ||isPending}>{isPending ? "Translating..." : "Translate"}</Button>

    </form>
    </DialogContent>
</Dialog>
  )
}

export default TranslateDocument
