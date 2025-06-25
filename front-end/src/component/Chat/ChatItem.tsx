import React, { useEffect, useState } from "react";
import { getUrlimg } from "../../utils/GetUrlImg";
import {formatCustomDate} from "../../utils/formatCustomDate"

import axios from "axios";

function ChatItem({ data, userId, setconversation,setConversationchats,refresh,setRefresh }) {
  console.log(data)
  const handlegetChatinfo=async (id)=>{
    console.log(id);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/chats/messages/${id}`, {
        withCredentials: true,
      });
      await axios.post(`${import.meta.env.VITE_API}/chats/seen`,{conversationId:id}, {
        withCredentials: true,
      });
      setRefresh(!refresh);
      setConversationchats(response.data);
      
    } catch (error) {
      console.log(error);
    }

  }
  return (
    <div
      className="bg-[#ffffff] cursor-pointer"
      onClick={() => {
        const isCurrentUser = userId === data.participant.id;
        // console.log(userId);
        handlegetChatinfo(data._id)
        setconversation({
          id: isCurrentUser ? data.creator.id : data.participant.id,
          con_id:data._id,
          name: isCurrentUser ? data.creator.name : data.participant.name,
          avatar:isCurrentUser ? data.creator.avatar : data.participant.avatar,
          message: " ",
        });
      }}
    >
      <div className="grid grid-cols-[70px_auto] items-center p-2">
        <div className="w-20">
          {/* <div className='h-15 w-15 bg-green-700 rounded-[100%]'></div> */}
          {console.log(data.creator.avatar )}

          <img
  src={
    userId === data.participant.id
      ? data.creator.avatar === null
        ? getUrlimg("man.png")
        :`${import.meta.env.VITE_API}/images/uploads/avatars/${data.creator.avatar}`
      : data.participant.avatar === null
        ? getUrlimg("man.png")
        : `${import.meta.env.VITE_API}/images/uploads/avatars/${data.participant.avatar}`
  }
  className="h-15 w-15 rounded-[100%]"
  alt=""
/>
        </div>
        <div>
          <div>
            <div className="grid grid-cols-2 content-between ">
              <h1 className="font-bold">
                {userId == data.participant.id
                  ? data.creator.name
                  : data.participant.name}
              </h1>
              <p className="text-end">{formatCustomDate(data.lastMessageTime)}</p>
            </div>
            <div className="grid grid-cols-[92%_auto] content-between mt-1">
              <p className="text-[14px]">{data.lastMessageText}</p>
              <div className="text-center bg-[#40c4ff] rounded-md">{data.unreadCount}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatItem;
