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

    //Merge latest message info with conversations
    const merged = conversations.map((conv) => {
      const match = latestMessages.find(
        (msg) => String(msg._id) === String(conv._id)
      );
      return {
        ...conv._doc,
        lastMessageTime: match?.lastMessageTime || conv.updatedAt,
        lastMessageText: match?.lastMessageText || "",
      };
    });

    // Sort by lastMessageTime (descending)
    merged.sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    res.status(200).json({ conversation: merged, userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to fetch conversations." });
  }
}

//Send new message
async function sendMessage(req, res, next) {
  // console.log(req.user.userId);
  if (req.body.message) {
    try {
      let attachments = null;
      const messages = new Message({
        text: req.body.message,
        attachment: attachments,
        sender: {
          id: req.user.userid,
          name: req.user.username,
          avatar: req.user.avatar ?? null,
        },
        receiver: {
          id: req.body.conversationInfo.id,
          name: req.body.conversationInfo.name,
          avatar: req.body.conversationInfo.avatar ?? null,
        },
        conversation_id: req.body.conversationInfo.con_id,
      });
      const result = await messages.save();
      console.log("hello1");
      // handle live message
      let _id=req.body.conversationInfo.con_id;
      
      const message={
        conversation_id: _id,
        sender: {
          id: req.user.userid,
          name: req.user.username,
          avatar: req.user.avatar || null,
        },
        message: req.body.message,
        attachment: attachments,
        date_time: result.date_time,
      }
      console.log(message.conversation_id)
      global.io.emit("new_message", {message,});
      console.log("hello");
      return res.status(200).json({ msg: "success", data: result });
    } catch (error) {
      console.log(error);
      res.status(500).json({ err: error });
    }
  } else {
    res.status(500).json({ msg: "message text or attachment is required!" });
  }
}
async function getMessage(req, res, next) {
  console.log(req.params.conversation_id);
  if (req.params.conversation_id) {
    try {
      const message = await Message.find({
        conversation_id: req.params.conversation_id,
      });
      console.log(message);
      res.status(200).json(message);
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log("conversion id is required");
    res.status(500).json({ msg: "conversion id is required" });
  }
  res.status(200).json();
}
module.exports = {
  addUser,
  addConversion,
  conversationItem,
  sendMessage,
  getMessage,
};
