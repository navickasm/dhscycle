const THE_FILE = "builder.html";

const express = require("express");
const path = require("path");
const http = require("http");

const app = express();

app.use(express.static(path.join(__dirname, "/")));

//app.get("*", (req, res) => {res.sendFile(path.join(__dirname + "/" + THE_FILE));});

app.set("port", 4000);

let server = http.createServer(app);
server.listen(4000);