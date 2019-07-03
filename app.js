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

app.listen(3001, () => {
  console.log("Connect server");
});
