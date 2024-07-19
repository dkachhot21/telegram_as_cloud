const { default: mongoose } = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter the Username"],
    },
    email: {
      type: String,
      required: [true, "Please add an email address"],
      unique: [true, "Email already exist"],
    },
    password: {
      type: String,
      required: [true, "Please enter the Password"],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
