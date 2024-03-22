import { readFile } from 'fs';
import React, { useEffect, useState } from 'react'
import io from 'socket.io-client';

const socket = io("http://localhost:3001");

interface MessageT {
    text?: string,
    file?:string,
    roomId?:string | number
}

const Chat = ({ username, roomId}: any) => {

    const [messages, setMessages] = useState<MessageT[]>([]);
    const [inputText, setInputText] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    

    useEffect(():any => {
        socket.on('receive_msg', (message) =>{
            setMessages((prev) => [...prev, message])
        })

        return socket.disconnect();
    }, [])

    const handleSubmitMessages = async () :Promise<void> =>{
        if(inputText.trim() || file){
            let messageData: MessageT = {
                text:inputText.trim(),
                file:'',
                roomId: roomId
            }

            if(file){
                messageData.file = await readFile(file)
            }

            socket.emit('send_msg', messageData);

            setFile(null);
            setInputText('');
        }
    }

    const readFile = (file: File): Promise<string> =>{
        return new Promise((resolve, reject) =>{
            const reader = new FileReader();

            reader.readAsDataURL(file);

            reader.onloadend = () =>{
                resolve(reader.result as string)
            }

            reader.onerror = (error) =>{
                reject(error);
            }
        })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void =>{
        const selectedFile = e.target.files?.[0];
        if(selectedFile){
            setFile(selectedFile);
        }
    }

  return (
    <div>
      {messages.map((message, index) =>{
        return(
           <div>
             {message.text && <p>{message.text}</p>}
           </div>
        )
      })}

      <input type='text' value={inputText} onChange={(e)=> setInputText(e.target.value)} placeholder='type your message' />

      <input type="file" onChange={handleFileChange} />

      <button onClick={handleSubmitMessages}>Send</button>
    </div>
  )
}

export default Chat
