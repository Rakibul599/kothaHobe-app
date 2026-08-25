import { useEffect, useRef, useState } from "react";
import { getUrlimg } from "../../utils/GetUrlImg";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io(`${import.meta.env.VITE_API}`, {
  withCredentials: true,
});

// Helper function to compress images down to ~200-300 KB
const compressImage = (file: File, maxWidth = 1200, quality = 0.7): Promise<File> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      return resolve(file);
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          quality
        );
      };
    };
  });
};

const isImageFile = (filenameOrUrl: string) => {
  if (!filenameOrUrl) return false;
  const lower = filenameOrUrl.toLowerCase();
  return (
    lower.includes("image") ||
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".svg") ||
    lower.startsWith("data:image/")
  );
};

function Conversation({
  conversationInfo,
  converstionchats,
  setConversationchats,
  userId,
  setRefresh,
  setTab,
}: any) {
  const [isSender, setSender] = useState(true);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedFullImage, setSelectedFullImage] = useState<string | null>(null);

  // Editing state
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  const scrollToBottom = (smooth = false) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === "" && !file) return;

    try {
      const formData = new FormData();
      if (message.trim() !== "") {
        formData.append("message", message);
      }
      formData.append("conversationInfo", JSON.stringify(conversationInfo));

      if (file) {
        let fileToSend = file;
        if (file.type.startsWith("image/")) {
          fileToSend = await compressImage(file);
        }
        formData.append("attachment", fileToSend);
      }

      await axios.post(
        `${import.meta.env.VITE_API}/chats/sendmessage`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
    } catch (error) {
      console.log(error);
    }

    setMessage("");
    setFile(null);
    setFilePreview(null);
    setSender(!isSender);
    setRefresh((prev: boolean) => !prev);
  };

  // Unsend / Delete Message
  const handleUnsend = async (msgId: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API}/chats/message/${msgId}`, {
        withCredentials: true,
      });
      setConversationchats((prev: any[]) =>
        prev.map((m) =>
          m._id === msgId ? { ...m, is_deleted: true, text: "", attachment: [] } : m
        )
      );
    } catch (error) {
      console.log("Unsend error:", error);
    }
  };

  // Edit Message
  const handleSaveEdit = async (msgId: string) => {
    if (!editingText.trim()) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API}/chats/message/${msgId}`,
        { text: editingText },
        { withCredentials: true }
      );
      setConversationchats((prev: any[]) =>
        prev.map((m) => (m._id === msgId ? { ...m, text: editingText } : m))
      );
      setEditingMsgId(null);
      setEditingText("");
    } catch (error) {
      console.log("Edit error:", error);
    }
  };

  // Save/Download Image
  const handleDownloadImage = async (imgUrl: string) => {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `kothahobe-image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(imgUrl, "_blank");
    }
  };

  useEffect(() => {
    socket.on("new_message", (data) => {
      if (data.message.conversation_id === conversationInfo.con_id) {
        setConversationchats((prev: any[]) => [
          ...prev,
          {
            _id: data.message._id || Date.now().toString(),
            text: data.message.message,
            sender: { id: data.message.sender.id },
            attachment: data.message.attachment,
            is_deleted: data.message.is_deleted || false,
            file: null,
          },
        ]);
      }
      setRefresh((prev: boolean) => !prev);
    });

    socket.on("message_deleted", (data) => {
      setConversationchats((prev: any[]) =>
        prev.map((m) =>
          m._id === data.message_id
            ? { ...m, is_deleted: true, text: "", attachment: [] }
            : m
        )
      );
    });

    socket.on("message_edited", (data) => {
      setConversationchats((prev: any[]) =>
        prev.map((m) => (m._id === data.message_id ? { ...m, text: data.text } : m))
      );
    });

    return () => {
      socket.off("new_message");
      socket.off("message_deleted");
      socket.off("message_edited");
    };
  }, [conversationInfo]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollToBottom(!isInitialLoad.current);
      isInitialLoad.current = false;
    }, 50);

    return () => clearTimeout(timeout);
  }, [converstionchats]);

  useEffect(() => {
    isInitialLoad.current = true;
  }, [conversationInfo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (selected.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(selected));
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeSelectedFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  return (
    <div className="h-[100vh] bg-[#ffffff] flex flex-col justify-between">
      {/* Header */}
      <div className="grid grid-cols-[20px_70px_auto] md:grid-cols-[70px_auto] gap-2.5 items-center m-1.5 border-b pb-2">
        <img
          src={getUrlimg("back.png")}
          className="block md:hidden cursor-pointer"
          onClick={() => setTab(false)}
          alt="Back"
        />
        <img
          src={
            conversationInfo.avatar === null || conversationInfo.id === 0
              ? getUrlimg("man.png")
              : import.meta.env.VITE_ENV === "production"
              ? conversationInfo.avatar
              : `${import.meta.env.VITE_API}/images/uploads/avatars/${
                  conversationInfo.avatar
                }`
          }
          className="h-14 w-14 rounded-full object-cover"
          alt="Avatar"
        />
        <h1 className="font-bold text-lg">{conversationInfo.name}</h1>
      </div>

      {/* Chat Messages */}
      <div className="bg-[#f0f0f3] flex-1 m-[0px_10px_0px_10px] p-3 overflow-y-scroll rounded-md">
        <div
          className={`text-lg font-bold text-center text-gray-500 my-4 ${
            conversationInfo.id === 0 ? "" : "hidden"
          }`}
        >
          Please select any conversation
        </div>

        {converstionchats.map((msg: any, index: number) => {
          const isMyMsg = msg.sender?.id == userId;
          const isEditingThis = editingMsgId === msg._id;
          const isDeleted = msg.is_deleted;

          return (
            <div
              key={msg._id || index}
              className={`group relative max-w-[65%] p-3 m-2 rounded-xl text-sm shadow-sm ${
                isDeleted
                  ? "bg-gray-100 border border-gray-300 text-gray-500 italic " +
                    (isMyMsg ? "ml-auto" : "")
                  : isMyMsg
                  ? "bg-blue-600 text-white ml-auto"
                  : "bg-gray-200 text-black"
              }`}
            >
              {/* Message Controls (Unsend / Edit for sender if not deleted) */}
              {isMyMsg && msg._id && !isDeleted && (
                <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-full text-[10px] text-white transition-opacity">
                  {msg.text && (
                    <button
                      onClick={() => {
                        setEditingMsgId(msg._id);
                        setEditingText(msg.text);
                      }}
                      className="hover:underline"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleUnsend(msg._id)}
                    className="text-red-300 hover:text-red-100 hover:underline"
                  >
                    Unsend
                  </button>
                </div>
              )}

              {/* Render Unsente/Deleted Status */}
              {isDeleted ? (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 italic">
                  <span>🚫</span>
                  <span>{isMyMsg ? "You unsent a message" : "Unsent a message"}</span>
                </div>
              ) : isEditingThis ? (
                /* Editing Input Form */
                <div className="flex flex-col gap-2 mt-2">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="p-1 rounded text-black border outline-none text-xs"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(msg._id)}
                      className="bg-green-500 text-white text-[11px] px-2 py-0.5 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingMsgId(null)}
                      className="bg-gray-400 text-white text-[11px] px-2 py-0.5 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                msg.text && <div className="break-words mb-1 pr-14">{msg.text}</div>
              )}

              {/* Server Attachments (only if not deleted) */}
              {!isDeleted && msg.attachment && msg.attachment.length > 0 && (
                <div className="mt-1">
                  {msg.attachment.map((att: string, idx: number) => {
                    const fileUrl = att.startsWith("http")
                      ? att
                      : `${import.meta.env.VITE_API}/uploads/avatars/${att}`;

                    if (isImageFile(att)) {
                      return (
                        <div key={idx} className="relative group/img">
                          <img
                            src={fileUrl}
                            alt="attachment"
                            onClick={() => setSelectedFullImage(fileUrl)}
                            className="max-w-full h-auto rounded-lg max-h-[260px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          />
                          <button
                            onClick={() => handleDownloadImage(fileUrl)}
                            className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/img:opacity-100 transition-opacity"
                          >
                            ⬇ Save
                          </button>
                        </div>
                      );
                    } else {
                      return (
                        <a
                          key={idx}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-white/20 p-2 rounded-lg underline"
                        >
                          📄 {att.split("/").pop()}
                        </a>
                      );
                    }
                  })}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area + File Preview Bar */}
      <div className="p-2 border-t bg-white">
        {/* Preview Bar (Messenger / WhatsApp style) */}
        {file && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-2 rounded-lg mb-2 max-w-md mx-auto">
            <div className="flex items-center gap-3">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="preview"
                  className="w-12 h-12 object-cover rounded-md border"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-200 flex items-center justify-center rounded-md font-bold text-blue-700">
                  📄
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-800 truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-[10px] text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={removeSelectedFile}
              className="text-red-500 hover:bg-red-100 p-1.5 rounded-full text-sm font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <form
          onSubmit={handleSend}
          className="flex items-center gap-3 px-3 py-1"
        >
          <label htmlFor="file-upload" className="cursor-pointer">
            <img
              src={getUrlimg("attach.png")}
              className="h-[28px] w-[28px]"
              alt="attach"
            />
          </label>
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            className="hidden"
          />

          <textarea
            className="bg-[#f0f0f3] min-h-[38px] max-h-[100px] px-3 py-2 rounded-xl flex-1 resize-none overflow-y-auto outline-none text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />

          <button type="submit" className="p-1">
            <img
              src={getUrlimg("send.png")}
              className="h-[28px] w-[28px]"
              alt="send"
            />
          </button>
        </form>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedFullImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="absolute top-5 right-5 flex items-center gap-3 z-50">
            <button
              onClick={() => handleDownloadImage(selectedFullImage)}
              className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg"
            >
              ⬇ Save Image
            </button>
            <button
              onClick={() => setSelectedFullImage(null)}
              className="text-white bg-gray-800 hover:bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold"
            >
              ✕
            </button>
          </div>
          <img
            src={selectedFullImage}
            alt="Full view"
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

export default Conversation;
