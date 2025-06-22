import { useEffect, useRef, useState } from "react";
import { getUrlimg } from "../../utils/GetUrlImg";
import axios from "axios";
import { io } from "socket.io-client";
import LeftMenu from "../leftMenu/LeftMenu";

const socket = io(`${import.meta.env.VITE_API}`, {
  withCredentials: true,
});

function Conversation({
  conversationInfo,
  setconversation,
  converstionchats,
  setConversationchats,
  userId,
  setUserid,
  refresh,
  setRefresh,
  setTab,
}) {
  const [isSender, setSender] = useState(true);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);

  const messagesEndRef = useRef(null);
  const isInitialLoad = useRef(true); //To detect if it's the first load

  const scrollToBottom = (smooth = false) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto", //Scroll behavior: smooth or instant
    });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setRefresh(!refresh);
    if (message.trim() === "" && !file) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API}/chats/sendmessage`,
        { message, conversationInfo },
        { withCredentials: true }
      );
    } catch (error) {
      console.log(error);
    }

    setConversationchats([
      ...converstionchats,
      { text: message, file: file, sender: { id: userId } },
    ]);

    setMessage("");
    setFile(null);
    setSender(!isSender);
  };

  useEffect(() => {
    socket.on("new_message", (data) => {
      if (data.message.conversation_id === conversationInfo.con_id) {
        setConversationchats((prev) => [
          ...prev,
          {
            text: data.message.message,
            sender: { id: data.message.sender.id },
            file: null,
          },
        ]);
      }
    });

    return () => {
      socket.off("new_message");
    };
  }, [conversationInfo]);

  // Scroll when messages change
  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollToBottom(!isInitialLoad.current); // smooth only if not first load
      isInitialLoad.current = false; // After first render
    }, 50);

    return () => clearTimeout(timeout);
  }, [converstionchats]);

  // Reset scroll mode on new conversation
  useEffect(() => {
    isInitialLoad.current = true;
  }, [conversationInfo]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className="h-[100vh] bg-[#ffffff]">
      <div className="grid grid-cols-[20px_70px_auto] md:grid-cols-[70px_auto] gap-2.5 items-center m-1.5">
        <img
          src={getUrlimg("back.png")}
          className="block md:hidden "
          onClick={() => setTab(false)}
          alt=""
        />
        <img
          src={getUrlimg("man.png")}
          className="h-15 w-15 rounded-[100%]"
          alt=""
        />
        <h1 className="font-bold">{conversationInfo.name}</h1>
      </div>

      <div>
        <div className="bg-[#f0f0f3] md:h-[75vh] h-[84vh] m-[0px_10px_0px_10px] p-3 overflow-y-scroll rounded-md">
          {converstionchats.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[50%] p-2 m-2 rounded-xl ${
                msg.sender.id == userId
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-300 text-black"
              }`}
            >
              {msg.text && <div>{msg.text}</div>}
              {msg.file && (
                <div className="mt-2">
                  {msg.file.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(msg.file)}
                      alt="attachment"
                      className="max-w-full h-auto rounded-md"
                    />
                  ) : (
                    <a
                      href={URL.createObjectURL(msg.file)}
                      download={msg.file.name}
                      className="underline text-sm"
                    >
                      {msg.file.name}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div>
          <form
            onSubmit={handleSend}
            className="grid md:grid-cols-[5%_85%_auto] grid-cols-[5%_70%_auto] gap-5 mt-3 ml-10 items-center"
          >
            <label htmlFor="file-upload">
              <img
                src={getUrlimg("attach.png")}
                className="h-[30px] w-[30px] mt-1 cursor-pointer"
                alt="attach"
              />
            </label>
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* <input
              type="text"
              className="bg-[#f0f0f3] h-[40px] px-2 rounded-md"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
            /> */}
            <textarea
              className="bg-[#f0f0f3] min-h-[30px] max-h-[120px] px-2 py-1 rounded-md w-full resize-none overflow-y-auto break-words"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
            />

            <button type="submit">
              <img
                src={getUrlimg("send.png")}
                className="h-[30px] w-[30px] mt-1"
                alt="send"
              />
            </button>
          </form>
        </div>
      </div>
      {/* <LeftMenu /> */}
    </div>
  );
}

export default Conversation;
