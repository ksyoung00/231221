// authController.js
const sha = require("sha256");
const { ObjectId } = require("mongoose").Types;

// 사용자 세션을 확인하는 함수
const checkUserSession = (req, res) => {
  if (req.session.user) {
    console.log("세션 유지");
    res.json({ user: req.session.user });
  } else {
    res.json({ user: null });
  }
};

// 사용자 로그인을 처리하는 함수
const loginUser = async (req, res, mydb) => {
  const { userId, userPw } = req.body;
  console.log(`id: ${userId}`);
  console.log(`pw: ${userPw}`);

  try {
    const result = await mydb.collection("account").findOne({ userId });

    if (!result) {
      return res.json({ error: "사용자를 찾을 수 없습니다" });
    } else if (result.userPw && result.userPw === sha(userPw)) {
      req.session.user = { userId, userPw };
      console.log("새로운 로그인");
      res.json({ user: req.session.user });
    } else {
      return res.json({ error: "비밀번호가 틀렸습니다" });
    }
  } catch (error) {
    console.error("로그인 에러:", error);
    res.status(500).json({ error: "서버 오류" });
  }
};

// 사용자 로그아웃을 처리하는 함수
const logoutUser = (req, res) => {
  console.log("로그아웃");
  req.session.destroy();
  res.json({ user: null });
};

// 사용자 회원가입을 처리하는 함수
const signupUser = async (req, res, mydb) => {
  console.log(req.body.userId);
  console.log(req.body.userPw);
  console.log(req.body.userGroup);
  console.log(req.body.userEmail);

  try {
    const collection = mydb.collection("account");
    await collection.insertOne({
      userId: req.body.userId,
      userPw: sha(req.body.userPw),
      userGroup: req.body.userGroup,
      userEmail: req.body.userEmail,
    });

    console.log("회원가입 성공");
    res.json({ message: "회원가입 성공" });
  } catch (err) {
    console.error("회원가입 에러:", err);
    res.status(500).send({ error: err.message });
  }
};

module.exports = {
  checkUserSession,
  loginUser,
  logoutUser,
  signupUser,
};
