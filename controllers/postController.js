// postController.js
const Post = require("../models/postModel");
const ObjectId = require("mongodb").ObjectId;

exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    const skip = (page - 1) * perPage;

    const posts = await Post.find()
      .sort({ wdate: -1 })
      .skip(skip)
      .limit(perPage)
      .lean();

    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    res.json({ docs: posts, totalPages });
  } catch (err) {
    console.error("posts err", err);
    res.status(500).send("Server error");
  }
};

exports.getPostTotal = async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    res.json({ total: totalPosts });
  } catch (err) {
    console.error("err", err);
    res.status(500).send("Server error");
  }
};

exports.readPost = async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await Post.findOne({ _id: postId }).lean();
    if (!post) {
      return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });
    }
    res.json(post);
  } catch (err) {
    console.error("err", err);
    res.status(500).send("Server error");
  }
};

exports.writePost = async (req, res) => {
  const { title, content, writer, wdate } = req.body;
  try {
    const newPost = new Post({ title, content, writer, wdate });
    await newPost.save();
    res.sendStatus(200);
  } catch (error) {
    console.error("작성 에러:", error);
    res.status(500).send("Server error");
  }
};

exports.updatePost = async (req, res) => {
  const { id, title, content, writer, wdate } = req.body;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "유효하지 않은 게시물 ID입니다." });
  }
  try {
    await Post.updateOne({ _id: id }, { title, content, writer, wdate });
    res.sendStatus(200);
  } catch (error) {
    console.error("작성 에러:", error);
    res.status(500).send("Server error");
  }
};

exports.deletePost = async (req, res) => {
  const postId = req.params.id;
  if (!ObjectId.isValid(postId)) {
    return res.status(400).json({ error: "유효하지 않은 게시물 ID입니다." });
  }
  try {
    await Post.deleteOne({ _id: postId });
    res.sendStatus(200);
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).send("Server error");
  }
};
