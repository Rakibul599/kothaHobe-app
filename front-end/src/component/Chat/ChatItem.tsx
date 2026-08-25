import React from "react";
import { getUrlimg } from "../../utils/GetUrlImg";
import { formatCustomDate } from "../../utils/formatCustomDate";
import axios from "axios";

function ChatItem({ data, userId, setconversation, setConversationchats, setRefresh }: any) {
  const handlegetChatinfo = async (id: string) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/chats/messages/${id}`, {
        withCredentials: true,
      });
      setConversationchats(response.data);

      // Async call for seen status update so it doesn't block UI
      axios
        .post(
          `${import.meta.env.VITE_API}/chats/seen`,
          { conversationId: id },
          { withCredentials: true }
        )
        .then(() => setRefresh((prev: boolean) => !prev))
        .catch(() => {});
    } catch (error) {
      console.log("Error fetching messages:", error);
    }
  };

  const isCurrentUser = userId === data.participant?.id;
  const partnerAvatar = isCurrentUser ? data.creator?.avatar : data.participant?.avatar;
  const partnerName = isCurrentUser ? data.creator?.name : data.participant?.name;

  return (
    <div
      className="bg-[#ffffff] hover:bg-blue-50 transition-colors cursor-pointer border-b border-gray-100"
      onClick={() => {
        setconversation({
          id: isCurrentUser ? data.creator.id : data.participant.id,
          con_id: data._id,
          name: partnerName,
          avatar: partnerAvatar,
          message: " ",
        });
        handlegetChatinfo(data._id);
      }}
    >
      <div className="grid grid-cols-[60px_auto] items-center p-3">
        <div>
          <img
            src={
              partnerAvatar === null || !partnerAvatar
                ? getUrlimg("man.png")
                : import.meta.env.VITE_ENV === "production"
                ? partnerAvatar
                : `${import.meta.env.VITE_API}/images/uploads/avatars/${partnerAvatar}`
            }
            className="h-12 w-12 rounded-full object-cover"
            alt="User Avatar"
          />
        </div>
        <div>
          <div className="grid grid-cols-2 items-center">
            <h1 className="font-bold text-sm text-gray-800 truncate">{partnerName}</h1>
            <p className="text-xs text-gray-400 text-end">
              {formatCustomDate(data.lastMessageTime)}
            </p>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500 truncate max-w-[180px]">
              {data.lastMessageText || "Tap to open conversation"}
            </p>
            {data.unreadCount > 0 && (
              <span className="text-[11px] bg-blue-500 text-white font-bold px-2 py-0.5 rounded-full">
                {data.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatItem;
