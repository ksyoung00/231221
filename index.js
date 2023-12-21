// 환경 변수
require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const sha = require("sha256");
// Post 모델
// const Post = require("./models/postModel");
// Controllers
const sessionController = require("./controllers/sessionController");
const authController = require("./controllers/authController");
const postController = require("./controllers/postController");

app.use(
  session({
    secret: process.env.SESSION_NO,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.json());

const PORT = process.env.PORT || 8080;
const URL = process.env.URL;

let mydb;
mongoose
  .connect(URL, {
    dbName: "coffee",
  })
  .then((mongodb) => {
    //mydb는 server.js 파일에서 선언되었지만, loginUser 함수가 호출되는 시점에서는 mydb가 아직 초기화되지 않았을 가능성이 높습니다. 이로 인해 mydb가 undefined로 설정되어 있을 때 loginUser 함수가 호출되므로 오류가 발생할 수 있음
    // 이 문제를 해결하기 위해, mydb가 초기화된 후에 loginUser 함수를 호출
    console.log("MongoDB에 연결");
    mydb = mongodb.connection.db;
  })
  .catch((err) => {
    console.error("MongoDB 연결 실패:", err);
  });

// build 디렉토리를 정적 파일로. 순서가 중요함 express.static 미들웨어가 먼저 나와야 함
app.use(express.static(path.join(__dirname, "build")));

// login
app.get("/login", sessionController.checkUserSession);
app.get("/", sessionController.checkUserSession);

app.post("/login", async (req, res) => {
  // if (mydb) {
  sessionController.loginUser(req, res, mydb);
  // } else {
  //   console.error("mydb is not initialized");
  //   res.status(500).json({ error: "서버 오류" });
  // }
});

// logout
app.get("/logout", sessionController.logoutUser);

// 회원가입
// app.get("/posts", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const perPage = 10;
//     const skip = (page - 1) * perPage;

//     const posts = await Post.find()
//       .sort({ wdate: -1 })
//       .skip(skip)
//       .limit(perPage)
//       .lean();
//     const totalPosts = await Post.countDocuments();

//     const totalPages = Math.ceil(totalPosts / perPage);

//     res.json({ docs: posts, totalPages });
//   } catch (err) {
//     console.error("posts err", err);
//     res.status(500).send("Server error");
//   }
// });

app.get("/posts", postController.getPosts);
app.get("/posts/total", postController.getPostTotal);
app.get("/posts/read/:id", postController.readPost);
app.post("/posts/write", postController.writePost);
app.post("/posts/update", postController.updatePost);
app.post("/posts/delete/:id", postController.deletePost);

// 에러 핸들링: 에러 처리하는 로직이 중복되어 있어 한 곳에 처리
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT} 포트에서 서버 실행`);
});
