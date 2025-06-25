import React, { useEffect, useState } from 'react'
import ChatNav from '../navbar/ChatNav'
import ChatItem from './ChatItem'
import chatdata from './chatdata'
import axios from 'axios'
import { getUrlimg } from '../../utils/GetUrlImg'
import { useNavigate } from 'react-router-dom'


function Chat({setconversation,setConversationchats,userId,setUserid,refresh,setRefresh,more,setMore}) {
  const [conversationData,setconversationData]=useState();
  const navigate = useNavigate();
  
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
    <ChatItem data={inf} userId={userId} key={index} setconversation={setconversation} setConversationchats={setConversationchats} refresh={refresh} setRefresh={setRefresh} />
  )) : null;
  async function handlelogout() {
    console.log("logout")
    try {
      const response= await axios.get(`${import.meta.env.VITE_API}/login/logout`, {
        withCredentials: true,
      })
      console.log(response.data)
      if(response.status==200)
      {
        navigate('/')
      }
    } catch (error) {
      console.error("Logout failed:", err);
    }
  }

  return (
    <div className="bg-[#ffffff] drop-shadow-xl">
      <ChatNav refresh={refresh} setRefresh={setRefresh}/>
    <div className={`mt-1 h-[80vh] overflow-y-scroll ${more ? "hidden": "block"}`}>
      {items}

    </div>
    <div className={`mt-1 h-[80vh] overflow-y-scroll ${more ? "block": "hidden"}`}>
      <div className='flex ml-[10%] gap-3.5 mt-[5%] cursor-pointer' onClick={()=>handlelogout()}>
      <img src={getUrlimg("logout.png")} alt="" className='h-[25px] w-[25px]'/>
      <p className='text-lg'>Logout</p>
      </div>
      
    </div>
  </div>
  )
}

export default Chat
