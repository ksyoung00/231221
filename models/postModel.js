const mongoose = require("mongoose");

// Post 스키마 정의
const postSchema = new mongoose.Schema({
  id: String,
  title: String,
  content: String,
  wdate: { type: Date, default: Date.now },
  writer: String,
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
