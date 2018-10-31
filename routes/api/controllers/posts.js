/* eslint consistent-return: "off" */
const express = require('express');
const passport = require('passport');
const router = express.Router();
const log = require('./../utils/logger');

// Load validation
const validatePostInput = require('./../../../validation/post');

//Load models
const Post = require('./../../../models/Post');

// @route   POST api/posts
// @desc    Create post
// @access  Private
router.post('/', passport.authenticate('jwt', {
  session: false
}), async (req, res) => {

  const { errors, isValid } = validatePostInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  const body = {
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id,
  };

  try {
    const newPost = await new Post(body).save();
    res.json(newPost);
  } catch (e) {
    log.error(e);
  }
});

module.exports = router;
