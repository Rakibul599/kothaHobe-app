import React, { useState } from "react";
import { getUrlimg } from "../../utils/GetUrlImg";


function ChatItem({data,setconversation}) {
  return (
    <div className="bg-[#ffffff] cursor-pointer " onClick={()=>{setconversation({id:data.id,name:data.name,message:data.message})}}>
      <div className="grid grid-cols-[70px_auto] items-center p-2">
        <div className="w-20">
          {/* <div className='h-15 w-15 bg-green-700 rounded-[100%]'></div> */}
          <img
            src={getUrlimg("man.png")}
            className="h-15 w-15 rounded-[100%]"
            alt=""
          />
        </div>
        <div>
          <div >
            <div className="grid grid-cols-2 content-between ">
              <h1 className="font-bold">{data.name}</h1>
              <p className="text-end">22:00 07/04/25</p>
            </div>
            <div className="grid grid-cols-[92%_auto] content-between mt-1">
              <p className="text-[14px]">Hi Iam rakibul..</p>
              <div className="text-center bg-[#40c4ff] rounded-md">10</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatItem;
