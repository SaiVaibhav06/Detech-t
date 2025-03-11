const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || "1h";

const app = express();
const PORT = 3000;
const TASKS_FILE = "tasks.json";
const USERS_FILE = "users.json";

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// 📌 Ensure JSON files exist
const ensureFileExists = (filename) => {
    if (!fs.existsSync(filename)) {
        fs.writeFileSync(filename, "[]", "utf8");
    }
};

ensureFileExists(TASKS_FILE);
ensureFileExists(USERS_FILE);

// 📌 Load data from file
const loadData = (filename) => {
    try {
        const data = fs.readFileSync(filename, "utf8").trim();
        return data ? JSON.parse(data) : [];
    } catch (err) {
        console.error(`Error loading ${filename}:`, err);
        return [];
    }
};

// 📌 Save data to file
const saveData = (filename, data) => {
    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
        console.error(`Error saving ${filename}:`, err);
    }
};

// ✅ **SIGNUP ROUTE**
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password are required." });

    let users = loadData(USERS_FILE);
    const normalizedUsername = username.trim().toLowerCase();

    // Check if username already exists
    if (users.find(user => user.username === normalizedUsername)) {
        return res.status(409).json({ error: "Username already exists." });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username: normalizedUsername, password: hashedPassword });
    saveData(USERS_FILE, users);

    res.json({ success: true, message: "User registered successfully. Please log in." });
});

// ✅ **LOGIN ROUTE**
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password are required." });

    let users = loadData(USERS_FILE);
    const normalizedUsername = username.trim().toLowerCase();
    const user = users.find(user => user.username === normalizedUsername);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid username or password." });
    }

    // Generate JWT Token
    const token = jwt.sign({ username: normalizedUsername }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });

    res.json({ success: true, message: "Login successful!", token });
});

// ✅ **GET TASKS ROUTE**
app.get("/tasks", (req, res) => {
    res.json(loadData(TASKS_FILE));
});

// ✅ **ADD TASK ROUTE**
app.post("/add-task", (req, res) => {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: "Task is required." });

    let tasks = loadData(TASKS_FILE);
    const normalizedTask = task.trim().toLowerCase();

    // Prevent duplicate tasks
    if (tasks.some(t => t.toLowerCase() === normalizedTask)) {
        return res.status(409).json({ error: "Task already exists." });
    }

    tasks.push(task.trim());
    saveData(TASKS_FILE, tasks);
    res.json({ success: true, task });
});

// ✅ **DELETE TASK ROUTE**
app.post("/delete-task", (req, res) => {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: "Task is required." });

    let tasks = loadData(TASKS_FILE);
    const normalizedTask = task.trim().toLowerCase();

    // Check if task exists
    if (!tasks.some(t => t.toLowerCase() === normalizedTask)) {
        return res.status(404).json({ error: "Task not found." });
    }

    tasks = tasks.filter(t => t.toLowerCase() !== normalizedTask);
    saveData(TASKS_FILE, tasks);
    res.json({ success: true, message: "Task deleted successfully." });
});

// ✅ **START SERVER**
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username }); // Ensure you query by username, not email
        if (!user) {
            return res.status(400).json({ error: "User not found." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid credentials." });
        }

        const token = jwt.sign({ username: user.username }, "your_secret_key", { expiresIn: "1h" });

        // ✅ Ensure response includes the actual username, not email
        res.json({ success: true, token, username: user.username });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error." });
    }
});
