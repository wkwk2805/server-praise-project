const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

//db.defaults({ posts: [], user: {} }).write();

app.get("/create_db", (req, res) => {
  const adapter = new FileSync("db.json");
  const db = low(adapter);
  db.defaults({ lyrics: [1, 2, 3] }).write();
  res.send("create File");
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello express");
});

app.listen(3001, () => {
  console.log("Connect server");
});
