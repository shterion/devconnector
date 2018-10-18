// process.env.NODE_CONFIG_DIR = './config'

const config = require("config");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');

// Routes
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();

const PORT = config.get('PORT');

// Middlewares
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

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

// Use routes
app.use('/users', users);
app.use('/profile', profile);
app.use('/posts', posts);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));