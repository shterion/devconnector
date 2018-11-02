/* eslint consistent-return: "off" */
const express = require('express');
const passport = require('passport');

const router = express.Router();
const log = require('./../utils/logger');

// Load validation
const validatePostInput = require('./../../../validation/post');

// Load models
const Post = require('./../../../models/Post');
const Profile = require('./../../../models/Profile');

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
router.get('/', async (req, res) => {
  const errors = {};
  try {
    const posts = await Post.find().sort({
      date: -1,
    });
    if (!posts) {
      errors.noposts = 'No posts found!';
      return res.send(404).json(errors);
    }
    res.send(posts);
  } catch (e) {
    log.error(e);
    res.status(404).json(e);
  }
});

// @route   GET api/posts/:id
// @desc    Get a post by id
// @access  Public
router.get('/:id', async (req, res) => {
  const errors = {};

  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      errors.nopostfound = 'No post with this ID found!';
      return res.status(404).json(errors);
    }
    res.status(200).json(post);
  } catch (e) {
    errors.nopostfound = `No post with ID: ${req.params.id} found!`;
    return res.status(404).json(errors);
  }
});

// @route   POST api/posts
// @desc    Create post
// @access  Private
router.post('/', passport.authenticate('jwt', {
  session: false,
}), async (req, res) => {
  const {
    errors,
    isValid,
  } = validatePostInput(req.body);

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

// @route   DELETE api/posts/:id
// @desc    Delete post
// @access  Private
router.delete('/:id', passport.authenticate('jwt', {
  session: false,
}), async (req, res) => {
  Post.findOneAndDelete({
    user: req.user.id,
    _id: req.params.id,
  })
    .then((post) => {
      if (!post) {
        return res.status(404).json({
          postnotfound: 'No post found',
        });
      }
      res.json(post);
    }).catch(err => res.send(err));

  // Profile.findOne({
  //     user: req.user.id
  //   })
  //   .then(profile => {
  //     Post.findById(req.params.id)
  //       .then(post => {
  //         if (post.user.toString() !== req.user.id) {
  //           return res.status(401).json({
  //             noauthorized: 'User not authorized'
  //           });
  //         }
  //         post.remove().then(() => res.json({
  //           success: true
  //         }));
  //       }).catch(err => res.status(404).json({
  //         postnotfound: 'No post found'
  //       }));
  //   })
});

// @route   POST api/posts/like/:id
// @desc    Like post
// @access  Private
router.post('/like/:id', passport.authenticate('jwt', {
  session: false,
}), (req, res) => {
  Profile.findOne({
    user: req.user.id,
  })
    .then(() => {
      Post.findById(req.params.id)
        .then((post) => {
          const liked = post.likes.filter(like => like.user.toString() === req.user.id);

          if (liked.length > 0) {
            return res.status(400).json({
              alreadyliked: 'User already liked this post',
            });
          }
          post.likes.unshift({
            user: req.user.id,
          });

          post.save()
            .then(savedPost => res.json(savedPost));
        });
    }).catch(() => res.status(404).json({
      postnotfound: 'No post found',
    }));
});

// @route   POST api/posts/dislike/:id
// @desc    Dislike post
// @access  Private
router.post('/dislike/:id', passport.authenticate('jwt', {
  session: false,
}), (req, res) => {
  Profile.findOne({
    user: req.user.id,
  })
    .then(() => {
      Post.findById(req.params.id)
        .then((post) => {
          const liked = post.likes.filter(like => like.user.toString() === req.user.id);

          if (liked.length === 0) {
            return res.status(400).json({
              notliked: 'You have not liked this post',
            });
          }

          const removeIndex = post.likes.map(item => item.user.toString().indexOf(req.user.id));
          post.likes.splice(removeIndex, 1);

          post.save()
            .then(savedPost => res.json(savedPost));
        });
    });
});

// @route   POST api/posts/comment/:id
// @desc    Add comment to post
// @access  Private
router.post('/comment/:id', passport.authenticate('jwt', {
  session: false,
}), (req, res) => {
  const {
    errors,
    isValid,
  } = validatePostInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  Post.findById(req.params.id)
    .then((post) => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id,
      };

      if (!post) {
        return res.status(404).json({
          postnotfound: 'No post found',
        });
      }

      post.comments.unshift(newComment);
      post.save()
        .then(savedPost => res.json(savedPost))
        .catch(() => res.status(404).json({
          postnotfound: 'No post found',
        }));
    });
});

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Remove comment from post
// @access  Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {
  session: false,
}), (req, res) => {
  Post.findById(req.params.id)
    .then((post) => {
      if (!post) {
        return res.status(404).json({
          postnotfound: 'No post found',
        });
      }

      const deleteComment = post.comments
        .filter(comment => comment._id.toString() === req.params.comment_id);
      if (deleteComment.length === 0) {
        return res.send(404).json({
          commentnotexists: 'Comment does not exist',
        });
      }

      const removeIndex = post.comments
        .map(item => item._id.toString()).indexOf(req.params.comment_id);

      post.comments.splice(removeIndex, 1);
      post.save()
        .then(savedPost => res.json(savedPost));
    });
});

module.exports = router;
