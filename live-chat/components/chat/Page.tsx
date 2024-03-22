"use client"
import React, { useEffect, useState } from "react";
import style from "./chat.module.css";
import Link from "next/link";
import Emoji from '../emoji/Page';



interface IMsgDataTypes {
  roomId: String | number;
  user: String;
  msg: String;
  file?:{
    name:String,
    data:String,
  };
  time: String;
}

const ChatPage = ({ socket, username, roomId }: any) => {
  const [currentMsg, setCurrentMsg] = useState("");
  const [chat, setChat] = useState<IMsgDataTypes[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  


  // const utf8Encode = (str: string): Uint8Array => {
  //   const encoder = new TextEncoder();
  //   return encoder.encode(str);
  // };

  // const utf8Decode = (bytes: Uint8Array): string => {
  //   const decoder = new TextDecoder();
  //   return decoder.decode(bytes);
  // };

  const sendData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentMsg !== "" || file) {
      const msgData: IMsgDataTypes = {
        roomId,
        user: username,
        msg: currentMsg,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
          file:{
            name:file?.name || '',
            data:''
          }
      };

      if(file){
        msgData.file= {
            name:file.name,
            data: await readFile(file)
        } 
    }

    // console.log(file?.name);

      await socket.emit("send_msg", msgData);
      setCurrentMsg("");
      setFile(null);
    }
  };

  const readFile = (file: File): Promise<string> =>{
    return new Promise((resolve, reject) =>{
        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onloadend = () =>{
            console.log("reader file result =====", reader.result);
            resolve(reader.result as string)
        }

        reader.onerror = (error) =>{
            reject(error);
        }
    })
}


  useEffect(() => {
    socket.on("receive_msg", (data: IMsgDataTypes) => {
      setChat((pre) => [...pre, data]);
    });
  }, [socket]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void =>{
    const selectedFile = e.target.files?.[0];
    if(selectedFile){
        setFile(selectedFile);
    }
}

const handleEmojiSelect = (emoji: any) =>{
  console.log(emoji.native);
  setCurrentMsg(currentMsg + emoji.native);
}



  return (
    <div className={style.chat_div}>
      <div className={style.chat_border}>
        <div style={{ marginBottom: "1rem" }}>
          <p>
            Name: <b>{username}</b> and Room Id: <b>{roomId}</b>
          </p>
        </div>
        <div>
          {chat.map(({ user, msg,  file }, key) => {

        
            const handleFileConversion = (file: {name: String, data: String}):Blob =>{
                const arr = file.data.split(',');

                const mime = arr[0].match(/:(.*?);/)?.[1];
                const byteString = atob(arr[1]);
                let n = byteString.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = byteString.charCodeAt(n);
                }
                return new Blob([u8arr], { type: mime });
            }
           if(file)
           {
            const blob = handleFileConversion(file);
            // console.log(" blob file =====>",blob);
           }

           let downloadLink = null;
          if (file) {
            const blob = handleFileConversion(file);
            const blobUrl = URL.createObjectURL(blob);
            downloadLink = <a href={blobUrl} download={file.name}>{file.name}</a>;
          }
            console.log(file)
           return( <div
              key={key}
              className={
                user == username
                  ? style.chatProfileRight
                  : style.chatProfileLeft
              }
            >
              <span
                className={style.chatProfileSpan}
                style={{ textAlign: user == username ? "right" : "left" }}
              >
                {user.charAt(0)}
              </span>
              <h3 style={{ textAlign: user == username ? "right" : "left" }}>
                {msg}
              </h3>
              {file && downloadLink}
            </div>)
            })}
        </div>
        <div>
          <form onSubmit={(e) => sendData(e)}>
            <input
              className={style.chat_input}
              type="text"
              value={currentMsg}
              placeholder="Type your message.."
              onChange={(e) => setCurrentMsg(e.target.value)}
            />
            <input type="file" onChange={handleFileChange} />
            {showEmojiPicker && <Emoji onEmojiSelect={handleEmojiSelect } />}
            <button onClick={() => {setShowEmojiPicker(!showEmojiPicker)}}>Emoji</button>
            <button className={style.chat_button}>Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;