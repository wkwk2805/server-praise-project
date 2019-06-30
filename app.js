const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("lyrics.json");
const db = low(adapter);
const cors = require("cors");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const apply = require("./apply");

//cors setting
app.use(cors());

//body-parser setting
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//create database schema
app.get("/create_db", (req, res) => {
  db.defaults({ lyrics: [] }).write();
  res.send("create File");
});

//insert data
app.put("/api", (req, res) => {
  try {
    // id processing
    req.body.l_id = apply.processId(db);
    // contents processing
    req.body.contents = apply.processContents(req.body.contents);
    // file processing
    //apply.processFile(req.file);
    db.get("lyrics")
      .push(req.body)
      .write();
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

//select data
app.post("/api", (req, res) => {});

//delete data
app.delete("/api", (req, res) => {
  db.get("lyrics").remove({ id: req.body.id });
  res.json({ result: "success", message: "삭제성공" });
});

app.listen(3001, () => {
  console.log("Connect server");
});
