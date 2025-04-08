import React from 'react'
import ChatNav from '../navbar/ChatNav'
import ChatItem from './ChatItem'

function Chat() {
  return (
    <div className="bg-[#ffffff] drop-shadow-xl">
      <ChatNav />
    <div className='mt-1 h-[80vh] overflow-y-scroll'>
      <ChatItem />
      <ChatItem />
      <ChatItem />
      <ChatItem />
      <ChatItem />
      <ChatItem />
      <ChatItem />
      <ChatItem />
      <ChatItem />
    </div>
  </div>
  )
}

export default Chat
