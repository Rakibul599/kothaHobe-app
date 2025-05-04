import React from 'react'
import ChatNav from '../navbar/ChatNav'
import ChatItem from './ChatItem'
import chatdata from './chatdata'


function Chat({setconversation}) {

  
  let items = chatdata.map((inf, index) => (
    <ChatItem data={inf} key={index} setconversation={setconversation} />
  ))
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
