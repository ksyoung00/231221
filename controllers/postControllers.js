// Post 모델
const Post = require("../models/postModel");

exports.getPosts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const perPage = 10;
    const skip = (page - 1) * perPage;

    // .find() 문서 탐색
    // .sort() 정렬. 매개변수 없으면 기본 정렬. -1 역순 정렬
    // .skip() 건너 뛸 검색 수. 매개변수 없으면 건너띄지 않음
    // .limit() 반환 문서 최대 값
    // .lean() mongoose 문서 -> js 객체 변환
    const posts = await Post.find()
      .sort({ wdate: -1 })
      .skip(skip)
      .limit(perPage)
      .lean();
    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    res.json({ docs: posts, totalPages });
  } catch (error) {
    console.log("posts err: ", error);
    res.status(500).send("posts 서버 오류");
  }
};

exports.getPostTotal = async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    res.json({ total: totalPosts });
  } catch (error) {
    console.log("오류: ", error);
    res.status(500).send("서버 오류");
  }
};

exports.getPostWrite = async (req, res) => {
  const { title, content, writer, wdate } = req.body;
  try {
    const newPost = new Post({ title, content, writer, wdate });
    await newPost.save();
    res.sendStatus(200);
  } catch (error) {
    console.log("작성 오류: ", error);
    res.status(500).send("서버 작성 오류");
  }
};

exports.getPostRead = async (req, res) => {
  const postId = req.params.id;
  console.log(postId);

  try {
    const post = await Post.findOne({ _id: postId }).lean();
    if (!post) {
      return res.status(404).json({ error: "내용을 찾을 수 없습니다" });
    }
    res.json(post);
  } catch (error) {
    console.log("읽기오류: ", error);
    res.status(500).send("서버 읽기 오류");
  }
};

exports.getPostDelete = async (req, res) => {
  const postId = req.params.id;
  try {
    await Post.deleteOne({ _id: postId });
    res.sendStatus(200);
  } catch (error) {
    console.log("삭제 오류: ", error);
    res.status(500).send("서버 삭제 오류");
  }
};

exports.getPostUpdate = async (req, res) => {
  const { id, title, content, writer, wdate } = req.body;
  try {
    await Post.updateOne({ _id: id }, { title, content, writer, wdate });
    res.sendStatus(200);
  } catch (error) {
    console.log("수정 오류: ", error);
    res.status(500).send("서버 수정 오류");
  }
};
