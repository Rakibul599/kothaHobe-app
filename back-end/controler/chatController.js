const mongoose = require("mongoose");
const User = require("../models/People");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

//Searching for Add user
async function addUser(req, res, next) {
  const query = req.body.name.trim();
  const name_search_regex = new RegExp(escape(query), "i");
  const email_search_regex = new RegExp("^" + escape(query) + "$", "i");

  try {
    if (query !== "") {
      const user = await User.find({
        $or: [
          {
            name: name_search_regex,
          },
          {
            email: email_search_regex,
          },
        ],
      });
      res.json(user);
    } else {
      res.status(400).json({ message: "Search query cannot be empty." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while searching." });
  }
}
//After finding user then add to conversation
async function addConversion(req, res, next) {
  try {
    const checkAvail = await Conversation.findOne({
      $or: [
        {
          $and: [
            { "creator.id": req.user.userid },
            { "participant.id": req.body._id },
          ],
        },
        {
          $and: [
            { "participant.id": req.user.userid },
            {
              "creator.id": req.body._id,
            },
          ],
        },
      ],
    });
    if (checkAvail) {
      return res.status(400).json({ message: "Conversation already exists." });
    } else {
      const conversation = new Conversation({
        creator: {
          id: req.user.userid,
          name: req.user.username,
          avatar: req.user.avatar ?? null,
        },

        participant: {
          id: req.body._id,
          name: req.body.name,
          avatar: req.body.avater ?? null,
        },
      });

      const result = await conversation.save();
      res.status(200).json({
        message: "Conversation was added successfully!",
      });
    }
  } catch (error) {
    res.status(500).json({ msg: error });
  }
}
//Get conversation
// async function conversationItem(req, res, next) {
//   try {
//     const conversation = await Conversation.find({
//       $or: [
//         { "creator.id": req.user.userid },
//         { "participant.id": req.user.userid },
//       ],
//     });
//     res.status(200).json({ conversation, userId: req.user.userid });
//     // console.log(conversation);
//     // console.log("hello");
//   } catch (error) {
//     console.log(error);
//   }
// }
// new code:
// Get conversation list sorted by latest message
async function conversationItem(req, res, next) {
  try {
    const userId = req.user.userid;

    // Find all conversations for the current user
    const conversations = await Conversation.find({
      $or: [{ "creator.id": userId }, { "participant.id": userId }],
    });

    const conversationIds = conversations.map((c) => c._id);
    // console.log(conversationIds);

    // Aggregate messages to get latest message time for each conversation
    const latestMessages = await Message.aggregate([
      { $match: { conversation_id: { $in: conversationIds } } },
      { $sort: { date_time: -1 } },
      {
        $group: {
          _id: "$conversation_id",
          lastMessageTime: { $first: "$date_time" },
          lastMessageText: { $first: "$text" },
        },
      },
    ]);
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          conversation_id: { $in: conversationIds },
          "receiver.id": new mongoose.Types.ObjectId(userId),
          is_seen: false,
        },
      },
      {
        $group: {
          _id: "$conversation_id",
          unreadCount: { $sum: 1 },
        },
      },
    ]);
    // console.log(unreadCounts)
    //Merge latest message info with conversations
    const merged = conversations.map((conv) => {
      const last = latestMessages.find(
        (msg) => String(msg._id) === String(conv._id)
      );
      const unread = unreadCounts.find(
        (msg) => String(msg._id) === String(conv._id)
      );
      return {
        ...conv._doc,
        lastMessageTime: last?.lastMessageTime || conv.updatedAt,
        lastMessageText: last?.lastMessageText || "",
        unreadCount: unread?.unreadCount || 0,
      };
    });
    
    // Sort by lastMessageTime (descending)
    merged.sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );
    // console.log(merged)
    res.status(200).json({ conversation: merged, userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to fetch conversations." });
  }
}

//seen message
async function isSeen(req,res,next) {
  try {
    const userId = req.user.userid;
    const conversationId  = req.body.conversationId;

    if (!conversationId) {
      return res.status(400).json({ msg: "Conversation ID is required" });
    }

    // Update all unseen messages in the conversation where current user is the receiver
    const result = await Message.updateMany(
      {
        conversation_id: new mongoose.Types.ObjectId(conversationId),
        "receiver.id": new mongoose.Types.ObjectId(userId),
        is_seen: false,
      },
      {
        $set: { is_seen: true },
      }
    );

    res.status(200).json({
      msg: "Messages marked as seen",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark seen error:", error);
    res.status(500).json({ msg: "Failed to update seen status" });
  }
  
}

//Send new message
async function sendMessage(req, res, next) {
  try {
    let conversationInfo = req.body.conversationInfo;
    if (typeof conversationInfo === "string") {
      try {
        conversationInfo = JSON.parse(conversationInfo);
      } catch (e) {}
    }

    let attachments = [];
    if (req.file) {
      if (process.env.NODE_ENV === "development") {
        attachments.push(req.file.filename);
      } else {
        attachments.push(req.file.path);
      }
    } else if (req.body.attachment) {
      attachments.push(req.body.attachment);
    }

    const messageText = req.body.message || "";

    if (messageText.trim() !== "" || attachments.length > 0) {
      const messages = new Message({
        text: messageText,
        attachment: attachments,
        sender: {
          id: req.user.userid,
          name: req.user.username,
          avatar: req.user.avatar ?? null,
        },
        receiver: {
          id: conversationInfo.id,
          name: conversationInfo.name,
          avatar: conversationInfo.avatar ?? null,
        },
        conversation_id: conversationInfo.con_id,
      });
      const result = await messages.save();

      let _id = conversationInfo.con_id;

      const message = {
        conversation_id: _id,
        sender: {
          id: req.user.userid,
          name: req.user.username,
          avatar: req.user.avatar || null,
        },
        message: messageText,
        attachment: attachments,
        date_time: result.date_time,
      };

      global.io.emit("new_message", { message });
      return res.status(200).json({ msg: "success", data: result });
    } else {
      return res.status(400).json({ msg: "message text or attachment is required!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: error });
  }
}
async function getMessage(req, res, next) {
  if (req.params.conversation_id) {
    try {
      const messages = await Message.find({
        conversation_id: req.params.conversation_id,
      })
        .sort({ createdAt: 1 })
        .lean();

      return res.status(200).json(messages);
    } catch (error) {
      console.log("Error getting messages:", error);
      return res.status(500).json({ msg: "Error fetching messages" });
    }
  } else {
    return res.status(400).json({ msg: "Conversation ID is required" });
  }
}
async function deleteMessage(req, res, next) {
  try {
    const messageId = req.params.message_id;
    const userId = req.user.userid;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }

    if (String(message.sender.id) !== String(userId)) {
      return res.status(403).json({ msg: "Unauthorized to delete this message" });
    }

    message.is_deleted = true;
    message.text = "";
    message.attachment = [];
    const updated = await message.save();

    global.io.emit("message_deleted", {
      message_id: messageId,
      conversation_id: message.conversation_id,
      is_deleted: true,
    });

    return res.status(200).json({ msg: "Message unsent successfully", data: updated });
  } catch (error) {
    console.error("Delete message error:", error);
    return res.status(500).json({ msg: "Failed to delete message" });
  }
}

async function editMessage(req, res, next) {
  try {
    const messageId = req.params.message_id;
    const { text } = req.body;
    const userId = req.user.userid;

    if (!text || !text.trim()) {
      return res.status(400).json({ msg: "Message text is required" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }

    if (String(message.sender.id) !== String(userId)) {
      return res.status(403).json({ msg: "Unauthorized to edit this message" });
    }

    message.text = text.trim();
    const updated = await message.save();

    global.io.emit("message_edited", {
      message_id: messageId,
      conversation_id: message.conversation_id,
      text: updated.text,
    });

    return res.status(200).json({ msg: "Message edited successfully", data: updated });
  } catch (error) {
    console.error("Edit message error:", error);
    return res.status(500).json({ msg: "Failed to edit message" });
  }
}

module.exports = {
  addUser,
  addConversion,
  conversationItem,
  sendMessage,
  getMessage,
  isSeen,
  deleteMessage,
  editMessage,
};
