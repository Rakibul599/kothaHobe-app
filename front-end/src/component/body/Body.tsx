import React, { useEffect, useState } from "react";
import Chat from "../Chat/Chat";
import LeftMenu from "../leftMenu/LeftMenu";
import Conversation from "../conversation/Conversation";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Body() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<boolean>(false);
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API}/chats`, {
          withCredentials: true,
        });

        navigate("/chats");
        console.log("Auto-logged in!", response.data.user.username);
      } catch (error) {
        console.log("Error fetching chats:", error);
        navigate("/"); // Not logged in
      }
    };

    fetchChats();
  }, []);

  let [conversationInfo, setconversation] = useState<{
    id: number;
    con_id: number;
    name: string;
    message: string;
  }>({ id: 0, con_id: 0, name: "", message: "" });
  let [converstionchats, setConversationchats] = useState([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [userId, setUserid] = useState();
  return (
    <div className="grid md:grid-cols-[70px_400px_auto] grid-cols-[auto]">
      {/* Left sidebar */}
      <div className={`md:order-1 order-2 ${tab ? "hidden" : "block"} md:block `}>
        <LeftMenu />
      </div>

      {/* Chat List */}
      <div
        className={`md:order-2 order-1 ${tab ? "hidden" : "block"} md:block`}
      >
        <Chat
          setconversation={(info) => {
            setconversation(info);
            setTab(true); // Activate tab on click
          }}
          setConversationchats={setConversationchats}
          userId={userId}
          setUserid={setUserid}
          refresh={refresh}
          setRefresh={setRefresh}
        />
      </div>

      {/* Conversation Panel */}
      <div className={`order-3 ${tab ? "block" : "hidden"} md:block`}>
        <Conversation
          conversationInfo={conversationInfo}
          setconversation={setconversation}
          converstionchats={converstionchats}
          setConversationchats={setConversationchats}
          userId={userId}
          setUserid={setUserid}
          refresh={refresh}
          setRefresh={setRefresh}
          setTab={setTab}
        />
      </div>
    </div>
  );
}

export default Body;
