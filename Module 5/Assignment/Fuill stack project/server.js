// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "tasks.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function loadTasks() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function saveTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), "utf8");
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

app.get("/api/tasks", (req, res) => {
  const tasks = loadTasks();
  res.json(tasks);
});

app.post("/api/tasks", (req, res) => {
  const { title, description = "", dueDate = "" } = req.body;
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "title required" });
  }
  const tasks = loadTasks();
  const newTask = {
    id: makeId(),
    title: title.trim(),
    description: description.trim(),
    dueDate: dueDate || "",
    completed: false,
    createdAt: new Date().toISOString()
  };
  tasks.unshift(newTask);
  saveTasks(tasks);
  res.status(201).json(newTask);
});

app.put("/api/tasks/:id", (req, res) => {
  const id = req.params.id;
  const { title, description = "", dueDate = "", completed } = req.body;
  const tasks = loadTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "not found" });

  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "title required" });
  }

  tasks[idx] = {
    ...tasks[idx],
    title: title.trim(),
    description: description.trim(),
    dueDate: dueDate || "",
    completed: !!completed
  };
  saveTasks(tasks);
  res.json(tasks[idx]);
});

app.patch("/api/tasks/:id/toggle", (req, res) => {
  const id = req.params.id;
  const tasks = loadTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  tasks[idx].completed = !tasks[idx].completed;
  saveTasks(tasks);
  res.json(tasks[idx]);
});

app.delete("/api/tasks/:id", (req, res) => {
  const id = req.params.id;
  let tasks = loadTasks();
  const initialLen = tasks.length;
  tasks = tasks.filter(t => t.id !== id);
  if (tasks.length === initialLen) return res.status(404).json({ error: "not found" });
  saveTasks(tasks);
  res.json({ success: true });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Task manager running at http://localhost:${PORT}`);
});
