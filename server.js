const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("views"));

// Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "charlotte",
  database: "recipe_app",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Database connected...");
});

// Utility functions
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Token required" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "LogIn.html"));
  });
  
// Routes
// --- Sign-up ---

app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
  
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    db.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, hashedPassword],
      (err) => {
        if (err) {
          console.error("Database error: ", err); // Log the actual error
          return res.status(500).json({ message: "Database error", error: err });
        }
  
        // Redirect to login page after successful registration
        res.redirect("/login"); // Assuming your login page is accessible at /login
      }
    );
  });
  
  
  

// --- Login ---
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0)
        return res.status(404).json({ message: "User not found" });

      const user = results[0];

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword)
        return res.status(401).json({ message: "Invalid password" });

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.status(200).json({ message: "Login successful", token });
    }
  );
});

// --- Add Recipe ---
app.post("/recipes", authenticateToken, (req, res) => {
  const { title, ingredients, instructions, category, image } = req.body;
  const userId = req.user.id;

  db.query(
    "INSERT INTO recipes (title, ingredients, instructions, category, image, user_id) VALUES (?, ?, ?, ?, ?, ?)",
    [title, ingredients, instructions, category, image, userId],
    (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.status(201).json({ message: "Recipe added successfully" });
    }
  );
});

// --- Get Recipes ---
app.get("/recipes", (req, res) => {
  db.query("SELECT * FROM recipes", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.status(200).json(results);
  });
});

// --- Secure API: Recipes by User ---
app.get("/recipes/user", authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.query("SELECT * FROM recipes WHERE user_id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.status(200).json(results);
  });
});

// --- Get Users (Admin-only endpoint) ---
app.get("/users", authenticateToken, (req, res) => {
  // Only accessible if user is admin; admin flag could be stored in the `users` table
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.status(200).json(results);
  });
});

// Server Listening
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
