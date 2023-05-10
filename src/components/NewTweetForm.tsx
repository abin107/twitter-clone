import { useSession } from "next-auth/react";
import { Button } from "./Button";
import { ProfileImage } from "./ProfileImage";
import { FormEvent, useCallback, useLayoutEffect, useRef, useState } from "react";
import { api } from "~/utils/api";

function updateTextAresSize (textarea ?: HTMLTextAreaElement){
    if (textarea == null) return

    textarea.style.height = '0'
    textarea.style.height = `${textarea.scrollHeight}px`
}

export function NewTweetForm() {
    const session = useSession();
    if (session.status !== 'authenticated') return null;

    return <Form />
} 

function Form() {
    const session = useSession();
    const [inputValue, setInputValue] = useState("");
    const  textAreaRef = useRef<HTMLTextAreaElement>();
    
    const inputRef = useCallback ((textArea : HTMLTextAreaElement) => {
        updateTextAresSize(textArea);
        textAreaRef.current = textArea; 
    }, []);


    useLayoutEffect (() => {
        updateTextAresSize(textAreaRef.current)
    }, [inputValue])

    const createTweet = api.tweet.create.useMutation({
        onSuccess : newTweet => {
            setInputValue ('');
        }
    });

    if (session.status !== 'authenticated') return null;

    function handleSubmit (e : FormEvent) {
        e.preventDefault()
        createTweet.mutate({ content : inputValue})
    }
    return <form 
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 border-b px-4 py-2"
    >
        <div 
            className="flex gap-4"
        >
            <ProfileImage src={session.data.user.image}/>
            <textarea
                ref={inputRef}
                style={{ height : 0 }}
                value={inputValue}
                onChange={ e => {
                    setInputValue (e.target.value)
                }}
                className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none"
                placeholder="What's happening?"
            />
            <Button
                className="self-end"
            >
                Tweet
            </Button>
        </div>
    </form>
}

