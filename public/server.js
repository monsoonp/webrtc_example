const express = require("express");
const app = express();

app.use(express.json());

app.get("/test", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
  res.end('{"testcode":"200", "text":"Electorn Test~"}');
});

const server = app.listen(5500, () => {
  console.log("server: ", server.address());
});

module.exports = app;
