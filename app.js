const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 5000; 

app.use(cors());
app.use(express.json());

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.mongoDB_URL);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1); // Exit process with failure
    }
};

// Connect to the database
connectDB();

const TodoSchema = new mongoose.Schema({
    task: { type: String, required: true },
    description: { type: String, required: true },
    details: String,
    status: { type: Boolean, default: false },
});

const Todo = mongoose.model('Todo', TodoSchema);

app.get('/api/todos', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching todos', error: error.message });
    }
});

app.post('/api/todos', async (req, res) => {
    try {
        const { task, description, details, status } = req.body;
        const newTodo = new Todo({
            task,
            description,
            details,
            status,
        });
        const savedTodo = await newTodo.save();
        res.json(savedTodo);
    } catch (error) {
        res.status(500).json({ message: 'Error creating todo', error: error.message });
    }
});

app.put('/api/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { task, description, details, status } = req.body;
        const updatedTodo = await Todo.findByIdAndUpdate(
            id,
            { task, description, details, status },
            { new: true } // Return the updated document
        );
        if (!updatedTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json(updatedTodo);
    } catch (error) {
        res.status(500).json({ message: 'Error updating todo', error: error.message });
    }
});

app.delete('/api/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTodo = await Todo.findByIdAndDelete(id);
        if (!deletedTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting todo', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});