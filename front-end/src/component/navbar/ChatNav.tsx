import React from 'react'
import { getUrlimg } from '../../utils/GetUrlImg'
function ChatNav() {
  return (
    <div className="h-[110px] bg-blue-600 flex place-content-between items-center p-2">
      <div>
        
        <div className="flex gap-1 ">
          <img
            src={getUrlimg("chat.png")}
            className="w-[30px] h-[30px]"
            alt=""
          />
          <p className="text-white">Kotha-Hobe!</p>
        </div>
      </div>
      <div className="flex gap-2">
        <img
          src={getUrlimg("search.svg")}
          className="brightness-0 invert h-[30px] w-[30px]"
          alt="Search Icon"
        />
        <img
          src={getUrlimg("plus.png")}
          className="brightness-0 invert h-[20px] w-[20px] mt-1"
          alt="Search Icon"
        />
      </div>
    </div>
  )
}

export default ChatNav
