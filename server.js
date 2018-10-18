// process.env.NODE_CONFIG_DIR = './config'

const config = require("config");
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = config.get('PORT');

// DB Config
const db = config.get('mongoURI');

// Connect to MongoDB
mongoose
    .connect(
        db, {
            useNewUrlParser: true
        }
    )
    .then(() => console.log("MongoDB connected..."))
    .catch(err => console.log(err));

app.get("/", (req, res) => {
    res.send("Works");
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));