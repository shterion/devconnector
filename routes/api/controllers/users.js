const express = require('express');

const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const log = require('./../utils/logger');

// Load User model
const User = require('./../../../models/User');

router.post('/register', async (req, res) => {
  try {
    const userExists = await User.findOne({
      email: req.body.email,
    });

    if (userExists === undefined || userExists === null) {
      try {
        const avatar = gravatar.url(req.body.email, {
          s: '200',
          r: 'pg',
          d: 'mm',
        });
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar,
          password: req.body.password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, async (e, hash) => {
            if (e) throw e;
            newUser.password = hash;
            try {
              const user = await newUser.save();
              res.json(user);
            } catch (error) {
              log.error(error);
            }
          });
        });
      } catch (error) {
        log.error(error);
      }
    } else {
      res.status(400).json({
        email: 'Email already exists!',
      });
    }
  } catch (error) {
    log.error(error);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    const { password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ email: 'User not found!' });
    } else {
      bcrypt.compare(password, user.password)
        .then((isMatch) => {
          if (isMatch) {

            const secret = config.get('secret');
            const payload = {
              id: user.id,
              name: user.name,
              email: user.email
            };

            jwt.sign(payload, secret, { expiresIn: 3600 }, (err, token) => {
              if (err) {
                return res.send(err);
              }
              res.send({
                success: true,
                token: `Bearer ${token}`
              })
            });
          } else {
            return res.status(400).json({ password: 'Password incorrect' });
          }
        });
    }
  } catch (error) {
    log.error(error);
  }
});

module.exports = router;
