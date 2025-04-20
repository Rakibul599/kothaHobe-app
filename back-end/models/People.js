const mongoose = require("mongoose");
const peopleSchema = mongoose.Schema(
  {
    avater: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    remember:{
        type:Boolean,
    }
  },
  {
    timestamps: true,
  }
);

const People = mongoose.model("people", peopleSchema);
module.exports = People;
