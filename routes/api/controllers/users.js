const express = require('express');

const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const passport = require('passport');
const log = require('./../utils/logger');

// Load Input Validation
const validateRegisterInput = require('./../../../validation/register');
const validateLoginInput = require('./../../../validation/login');

// Load User model
const User = require('./../../../models/User');

router.post('/register', async (req, res) => {
  const {
    errors,
    isValid
  } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

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
  const {
    errors,
    isValid
  } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  try {
    const {
      email
    } = req.body;
    const {
      password
    } = req.body;

    const user = await User.findOne({
      email
    });
    let token;

    if (!user) {
      errors.email = 'User not found';
      res.status(404).json(errors);
    } else {
      bcrypt.compare(password, user.password)
        .then((isMatch) => {
          if (isMatch) {
            const secret = config.get('secret');
            const payload = {
              id: user.id,
              name: user.name,
              email: user.email,
            };

            jwt.sign(payload, secret, {
              expiresIn: 3600
            }, (err, jwtToken) => {
              if (err) {
                return res.send(err);
              }
              token = jwtToken;
              return res.send({
                success: true,
                token: `Bearer ${jwtToken}`,
              });
            });
            return token;
          } else {
            errors.password = 'Password incorrect';
            return res.status(400).json(errors);
          }
        });
    }
  } catch (error) {
    log.error(error);
  }
});

router.get('/current', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
  });
});

module.exports = router;
