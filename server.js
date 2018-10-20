// require('./config/config');

const config = require('config');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Routes
const users = require('./routes/api/controllers/users');
const profile = require('./routes/api/controllers/profile');
const posts = require('./routes/api/controllers/posts');
const log = require('./routes/api/utils/logger');

const app = express();

const port = process.env.PORT || 5000;

// Middlewares
app.use(bodyParser.urlencoded({
  extended: false,
}));
app.use(bodyParser.json());

// DB Config
const db = config.get('mongoURI');

// Connect to MongoDB
const mongoOptions = {
  keepAlive: true,
  connectTimeoutMS: 30000,
  reconnectInterval: 1000,
  reconnectTries: Number.MAX_VALUE,
  useNewUrlParser: true,
  autoReconnect: true,
};

mongoose.connect(
  db, mongoOptions,
)
  .then(() => log.info('MongoDB connected...'))
  .catch(err => log.error(err));

app.get('/', (req, res) => {
  res.send('Works');
});

// Use routes
app.use('/users', users);
app.use('/profile', profile);
app.use('/posts', posts);

app.listen(port, () => log.info(`Server is running on port ${port}`));

module.exports = app;
