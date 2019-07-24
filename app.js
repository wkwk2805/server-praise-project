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

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });
//cors setting
app.use(cors());

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

//update data
app.patch("/api", (req, res) => {
  db.get("lyrics")
    .find({ id: req.body.id })
    .assign(req.body)
    .write();
  res.json({ result: "success", message: "수정성공" });
});

//delete data
app.delete("/api", (req, res) => {
  db.get("lyrics").remove({ id: req.body.id });
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

app.listen(3553, () => {
  console.log("Connect server");
});
