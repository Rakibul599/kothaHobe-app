import React from "react";
import Chat from "../Chat/Chat";
import LeftMenu from "../leftMenu/LeftMenu";
import Conversation from "../conversation/Conversation";

function Body() {
  return (
    <div className="grid grid-cols-[70px_400px_auto]  ">
      {/* Left side bar */}
      <LeftMenu />
      {/*chat item*/}
        <Chat />
      {/* Chat view */}
      <Conversation />
      
    </div>
  );
}

export default Body;
