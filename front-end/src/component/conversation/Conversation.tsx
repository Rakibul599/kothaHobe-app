import { useState } from "react";
import { getUrlimg } from "../../utils/GetUrlImg";
import axios from "axios";

function Conversation({
  conversationInfo,
  setconversation,
  converstionchats,
  setConversationchats,
  userId,
  setUserid,
  refresh,
  setRefresh,
}) {
  const [isSender, setSender] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null); // for storing the selected file

  const handleSend = async (e) => {
    e.preventDefault();
    console.log(converstionchats);
    setRefresh(!refresh);
    if (message.trim() === "" && !file) return;
    try {
      const response = await axios.post(
        "http://localhost:5000/chats/sendmessage",
        { message, conversationInfo },
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.log(error);
    }
    // Push message and/or file
    // setMessages([...messages, { text: message, file: file, sender: isSender }]);
    setConversationchats([...converstionchats,{ text: message, file: file, sender: { id: userId } }])
    setMessage("");
    setFile(null);
    setSender(!isSender);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className="h-[100vh] bg-[#ffffff]">
      <div className="grid grid-cols-[70px_auto] gap-2.5 items-center m-1.5">
        <img
          src={getUrlimg("man.png")}
          className="h-15 w-15 rounded-[100%]"
          alt=""
        />
        <h1 className="font-bold">{conversationInfo.name}</h1>
      </div>

      {/* Conversation */}
      <div>
        <div className="bg-[#f0f0f3] h-[78vh] m-[0px_10px_0px_10px] p-3 overflow-y-scroll rounded-md">
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
        </div>

        <div>
          <form
            onSubmit={handleSend}
            className="grid grid-cols-[5%_85%_auto] gap-5 mt-3 ml-10 items-center"
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

            <input
              type="text"
              className="bg-[#f0f0f3] h-[40px] px-2 rounded-md"
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
    </div>
  );
}

export default Conversation;
