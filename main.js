import express from "express";
import mongoose from "mongoose";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// MongoDB connection
const MONGO_URI = "mongodb://127.0.0.1:27017/todo";
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Mongoose Schema and Model
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    dueDate: { type: Date, default: null },
    priority: { type: String, enum: ["low", "normal", "high"], default: "normal" },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const Task = mongoose.model("Task", taskSchema);

// Create a new task
app.post("/tasks", async (req, res) => {
  const { title, description, dueDate, priority } = req.body;

  try {
    const newTask = await Task.create({ title, description, dueDate, priority });
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all tasks
app.get("/tasks", async (req, res) => {
  const { filter, priority } = req.query;

  try {
    const query = {};
    if (filter === "completed") query.isCompleted = true;
    if (filter === "incomplete") query.isCompleted = false;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific task by ID
app.get("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a task
app.put("/tasks/:id", async (req, res) => {
  const { title, description, dueDate, priority } = req.body;

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, dueDate, priority },
      { new: true, runValidators: true } // Return updated document and validate
    );

    if (!updatedTask) return res.status(404).json({ error: "Task not found" });

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark a task as done
app.patch("/tasks/:id/complete", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { isCompleted: true },
      { new: true }
    );

    if (!updatedTask) return res.status(404).json({ error: "Task not found" });

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ error: "Task not found" });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Server setup
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
