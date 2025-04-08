import React, { useState } from "react";
import { getUrlimg } from "../../utils/GetUrlImg";

function LeftMenu() {
  const [selectMenu, SetSelectMenu] = useState("");
  return (
    <div className="bg-[#FFFFFF] flex flex-col gap-5 items-center mt-3.5">
      <div
        className={`flex flex-col items-center p-2 w-full ${
          selectMenu == "chat" ? "bg-[#18b2f8] rounded-md" : ""
        } `}
        onClick={() => SetSelectMenu("chat")}
      >
        <img
          src={getUrlimg("messenger.png")}
          className="h-[25px] w-[25px]"
          alt=""
        />
        <p>Chats</p>
      </div>

      <div
        className={`flex flex-col items-center p-2 w-full ${
          selectMenu == "group" ? "bg-[#18b2f8] rounded-md" : ""
        } `}
        onClick={() => SetSelectMenu("group")}
      >
        <img
          src={getUrlimg("people.png")}
          className="h-[25px] w-[25px]"
          alt=""
        />
        <p>Groups</p>
      </div>
      <div
        className={`flex flex-col items-center p-2 w-full ${
          selectMenu == "profile" ? "bg-[#18b2f8] rounded-md" : ""
        } `}
        onClick={() => SetSelectMenu("profile")}
      >
        <img src={getUrlimg("user.png")} className="h-[25px] w-[25px]" alt="" />
        <p>Profile</p>
      </div>
      <div className="flex flex-col items-center p-2 w-full">
        <img src={getUrlimg("menu.png")} className="h-[25px] w-[25px]" alt="" />
        <p>More</p>
      </div>
    </div>
  );
}

export default LeftMenu;
