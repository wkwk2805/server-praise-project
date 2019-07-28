const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("lyrics.json");
const db = low(adapter);
const cors = require("cors");
const multer = require("multer");
const apply = require("./apply");
const fs = require("fs");
const session = require("express-session");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(
  session({
    secret: "asadlfkj!@#!@#dfgasdg",
    resave: false,
    saveUninitialized: true
  })
);
//cors setting
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

//body-parser setting
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

//create database schema
app.get("/create_db", (req, res) => {
  db.defaults({ lyrics: [] }).write();
  res.send("create File");
});

app.post("/api", upload.single("file"), (req, res) => {
  req.file && res.json(req.file.originalname);
});

//insert data
app.put("/api", (req, res) => {
  try {
    // copy data
    const data = Object.assign(req.body, {});
    // id processing
    data.l_id = apply.processId(db);
    // contents processing
    data.contents = apply.processContents(data.contents);
    // file name processing
    data.file = apply.processFile(data.file);
    // delete formData
    delete data.formData;
    // insert data
    db.get("lyrics")
      .push(data)
      .write();
    // insert result
    res.json({ result: "success", message: "등록성공" });
  } catch (error) {
    console.error(error);
    res.json({ result: "fail", message: "등록실패" });
  }
});

app.patch("/api/pre", (req, res) => {
  let lyrics = db
    .get("lyrics")
    .find({ l_id: req.body.id * 1 })
    .value();
  res.json(lyrics);
});

//update data
app.patch("/api", (req, res) => {
  if (req.body.file && req.body.preFile !== req.body.file) {
    // 기존 파일 제거 및 신규파일 추가
    fs.unlink(`./uploads/${req.body.preFile}`, function(err) {
      if (err) throw err;
      console.log("file deleted");
    });
  }
  req.body.preFile && delete req.body.preFile;
  // 내용 변경
  req.body.contents = apply.processContents(req.body.contents);
  let lyrics = db
    .get("lyrics")
    .find({ l_id: req.body.l_id * 1 })
    .assign(req.body)
    .write();
  res.json({ result: "success", message: "수정성공" });
});

//delete data
app.delete("/api", (req, res) => {
  db.get("lyrics")
    .remove({ l_id: req.body.id * 1 })
    .write();
  res.json({ result: "success", message: "삭제성공" });
});

app.get("/api", (req, res) => {
  res.json(
    db
      .get("lyrics")
      .take(9)
      .value()
  );
});

app.get("/api/search", (req, res) => {
  let result = db
    .get("lyrics")
    .filter(lyrics =>
      new RegExp(req.query.info).test(
        lyrics.contents.map(e => e.statement).join(" ") +
          lyrics.title +
          lyrics.code
      )
    )
    .take(9)
    .value();
  res.json(result);
});

app.get("/api/scroll", (req, res) => {
  const first = req.query.first;
  let result = db
    .get("lyrics")
    .filter(lyrics =>
      new RegExp(req.query.info).test(
        lyrics.contents.map(e => e.statement).join(" ") +
          lyrics.title +
          lyrics.code
      )
    )
    .filter((item, i) => i > first * 1)
    .take(6)
    .value();
  res.json(result);
});

app.get("/api/choice", (req, res) => {
  const ids = JSON.parse(req.query.id);
  const data = [];
  if (ids instanceof Array && ids.length > 0) {
    ids.forEach(id => {
      data.push(
        db
          .get("lyrics")
          .find({ l_id: id * 1 })
          .value()
      );
    });
  } else {
    data.push(
      db
        .get("lyrics")
        .find({ l_id: ids * 1 })
        .value()
    );
  }
  res.json(data);
});

const admin = {
  id: "admin",
  password: "111111"
};

app.post("/api/login", (req, res) => {
  const { id, password } = req.body;
  if (admin.id === id && admin.password === password) {
    req.session.isLogin = true;
  }
  if (req.session.isLogin) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.listen(3001, () => {
  console.log("Connect server");
});
