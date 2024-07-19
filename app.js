const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/dbConnection");
const cors = require("cors");
const dotenv = require("dotenv").config();

const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/file");

const app = express();

// Middleware
app.set("view engine", "ejs");
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Database connection
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/file", fileRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
