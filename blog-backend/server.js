const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;





// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== MySQL Connection =====
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
    process.exit(1);
  }
  console.log('✅ MySQL connected');
});

// ===== Routes =====

// Create a new post
app.post("/posts", (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "title and content are required" });
  }

  const sql = "INSERT INTO posts (title, content) VALUES (?, ?)";
  db.query(sql, [title, content], (err, result) => {
    if (err) {
      console.error("MySQL Error (Create Post):", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json({ id: result.insertId, title, content });
  });
});

// Get all posts
app.get("/posts", (req, res) => {
  db.query("SELECT * FROM posts", (err, results) => {
    if (err) {
      console.error("MySQL Error (Fetch Posts):", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json(results);
  });
});

// Create a comment (using default user_id = 1)
app.post("/comments", (req, res) => {
  const { post_id, comment } = req.body;
  const user_id = 1; // Default user

  if (!post_id || !comment) {
    return res.status(400).json({ error: "post_id and comment are required" });
  }

  const sql = "INSERT INTO comments (post_id, user_id, comment) VALUES (?, ?, ?)";
  db.query(sql, [post_id, user_id, comment], (err, result) => {
    if (err) {
      console.error("MySQL Error (Create Comment):", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json({ id: result.insertId, post_id, user_id, comment });
  });
});

// Get all comments for a post
app.get("/comments/:post_id", (req, res) => {
  const sql = "SELECT * FROM comments WHERE post_id = ?";
  db.query(sql, [req.params.post_id], (err, results) => {
    if (err) {
      console.error("MySQL Error (Fetch Comments):", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json(results);
  });
});

// Delete a comment
app.delete("/comments/:id", (req, res) => {
  const sql = "DELETE FROM comments WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error("MySQL Error (Delete Comment):", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json({ message: "Comment deleted" });
  });
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:5000`);
});
