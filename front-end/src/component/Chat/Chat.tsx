import React, { useEffect, useState } from 'react'
import ChatNav from '../navbar/ChatNav'
import ChatItem from './ChatItem'
import chatdata from './chatdata'
import axios from 'axios'


function Chat({setconversation,setConversationchats,userId,setUserid,refresh,setRefresh}) {
  const [conversationData,setconversationData]=useState();
  // const [userId,setUserid]=useState();
  // const [uid,setUid]=useState();
  // console.log("hello")
  useEffect(() => {
    const fetchChatConversion = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API}/chats/conversationitem`, {
          withCredentials: true,
        });
        setconversationData(response.data.conversation)
        setUserid(response.data.userId)
        // setUid(response.data.userId)
        // console.log(`${response.data.userId} user`); 
        // console.log(`${uid} user1`); 

      } catch (error) {
        console.error("Error fetching chat conversion:", error); 
      }
    };
    fetchChatConversion();
  }, [refresh]);
  const items = conversationData ? conversationData.map((inf: any, index: number) => (
    <ChatItem data={inf} userId={userId} key={index} setconversation={setconversation} setConversationchats={setConversationchats} />
  )) : null;
  return (
    <div className="bg-[#ffffff] drop-shadow-xl">
      <ChatNav />
    <div className='mt-1 h-[80vh] overflow-y-scroll'>
      {items}
      {/* <ChatItem />
      <ChatItem />
      <ChatItem />
      <ChatItem />
      <ChatItem />
      <ChatItem />
      <ChatItem />
      <ChatItem />
      <ChatItem /> */}
    </div>
  </div>
  )
}

export default Chat
