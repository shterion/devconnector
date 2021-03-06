// require('./config/config');

const config = require('config');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

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

mongoose.connect(db, mongoOptions)
  .then(() => log.info('MongoDB connected...'))
  .catch(err => log.error(err));

app.get('/', (req, res) => {
  res.send('Works');
});

app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);

// Use routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

app.listen(port, () => log.info(`Server is running on port ${port}`));

module.exports = app;
