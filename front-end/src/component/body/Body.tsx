import React, { useEffect, useState } from "react";
import Chat from "../Chat/Chat";
import LeftMenu from "../leftMenu/LeftMenu";
import Conversation from "../conversation/Conversation";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Body() {
  const navigate = useNavigate();
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get("http://localhost:5000/chats", {
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
    <div className="grid grid-cols-[70px_400px_auto]  ">
      {/* Left side bar */}
      <LeftMenu />
      {/*chat item*/}
      <Chat
        setconversation={setconversation}
        setConversationchats={setConversationchats}
        userId={userId}
        setUserid={setUserid}
        refresh={refresh}
        setRefresh={setRefresh}
      />
      {/* Chat view */}
      <Conversation
        conversationInfo={conversationInfo}
        setconversation={setconversation}
        converstionchats={converstionchats}
        setConversationchats={setConversationchats}
        userId={userId}
        setUserid={setUserid}
        refresh={refresh}
        setRefresh={setRefresh}

      />
    </div>
  );
}

export default Body;
