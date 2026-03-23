require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: { origin: "*" }
});

// ✅ DB CONNECTION (UTF8 FIX)
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "chat_app",
  charset: "utf8mb4"
});

db.connect(err => {
  if (err) console.log(err);
  else console.log("DB Connected");
});


// ======================
// 🔐 REGISTER
// ======================
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, password],
    (err) => {
      if (err) return res.status(400).send("User exists");
      res.send("Registered");
    }
  );
});


// ======================
// 🔐 LOGIN
// ======================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username=? AND password=?",
    [username, password],
    (err, result) => {
      if (result.length > 0) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    }
  );
});


// ======================
// 📩 GET MESSAGES
// ======================
app.get("/messages", (req, res) => {
  db.query("SELECT * FROM messages ORDER BY created_at ASC", (err, result) => {
    res.json(result);
  });
});


// ======================
// 👥 GET USERS
// ======================
app.get("/users", (req, res) => {
  db.query("SELECT username, is_online FROM users", (err, result) => {
    res.json(result);
  });
});


// ======================
// 🔌 SOCKET
// ======================
io.on("connection", (socket) => {

  socket.on("user_online", (username) => {
    db.query("UPDATE users SET is_online=1 WHERE username=?", [username]);
    io.emit("user_online", username);
  });

  socket.on("send_message", (data) => {
    db.query(
      "INSERT INTO messages (sender, message) VALUES (?, ?)",
      [data.sender, data.message]
    );

    io.emit("receive_message", data);
  });

  socket.on("typing", (name) => {
    socket.broadcast.emit("typing", name);
  });

  socket.on("stop_typing", () => {
    socket.broadcast.emit("stop_typing");
  });

});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});