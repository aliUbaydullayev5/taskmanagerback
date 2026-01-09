const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "dfshjfgsdkjhfgsdjkhfgsdhjkfsdgfjgh";

const mongoUri =
  "mongodb+srv://test:test@cluster0.hwi2jdk.mongodb.net/?appName=Cluster0";

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ MongoDB Cloud Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

const User = mongoose.model("User", {
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const Project = mongoose.model("Project", {
  name: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Task = mongoose.model("Task", {
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  title: String,
  description: String,
  status: { type: String, default: "Backlog" },
  priority: { type: String, default: "Medium" },
});

app.post("/api/auth/register", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  try {
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).json({ message: "User created" });
  } catch (e) {
    res.status(400).json({ error: "User already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ userId: user._id }, JWT_SECRET);
  res.json({ token, userId: user._id, username: user.username });
});

app.get("/api/projects/:userId", async (req, res) => {
  res.json(await Project.find({ userId: req.params.userId }));
});

app.post("/api/projects", async (req, res) => {
  const project = new Project(req.body);
  await project.save();
  res.json(project);
});

app.get("/api/tasks/:projectId", async (req, res) => {
  res.json(await Task.find({ projectId: req.params.projectId }));
});

app.post("/api/tasks", async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.json(task);
});

app.listen(5000, () => console.log("Server: http://localhost:5000"));
