/* eslint consistent-return: "off" */

const express = require('express');
const passport = require('passport');

const router = express.Router();
const log = require('./../utils/logger');

// Load validation
const valdiateProfileInput = require('./../../../validation/profile');
const validateExperienceInput = require('./../../../validation/experience');
const validateEducationInput = require('./../../../validation/education');

// Load Models
const User = require('./../../../models/User');
const Profile = require('./../../../models/Profile');

// @route   GET api/profile
// @desc    Get current users profile
// @access  Private
router.get('/', passport.authenticate('jwt', {
  session: false,
}), async (req, res) => {
  const errors = {};
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      errors.noprofile = 'There is no profile for this user';
      return res.status(404).json(errors);
    }

    res.json(profile);
  } catch (e) {
    log.error(e);
    res.status(404).json(e);
  }
});

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Public
router.get('/all', async (req, res) => {
  const errors = {};
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    if (!profiles) {
      errors.noprofile = 'There are no profiles';
      return res.status(404).json(errors);
    }
    res.json(profiles);
  } catch (e) {
    log.error(e);
    res.status(404).json({
      profile: 'There are profiles',
    });
  }
});

// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public
router.get('/handle/:handle', async (req, res) => {
  const errors = {};
  try {
    const profile = await Profile.findOne({
      handle: req.params.handle,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      errors.noprofile = 'There is no profile for this user';
      return res.status(404).json(errors);
    }
    res.json(profile);
  } catch (e) {
    log.error(e);
    res.send(404).json(errors);
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', async (req, res) => {
  const errors = {};
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      errors.noprofile = 'There is no profile for this user';
      return res.status(404).json(errors);
    }
    res.json(profile);
  } catch (e) {
    log.error(e);
    res.status(404).json({
      profile: 'There is no profile for this user',
    });
  }
});

// @route   POST api/profile
// @desc    Create or edit user profile
// @access  Private
router.post('/', passport.authenticate('jwt', {
  session: false,
}), async (req, res) => {
  const {
    errors,
    isValid,
  } = valdiateProfileInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const profileFields = {};
  profileFields.user = req.user.id;

  if (req.body.handle) profileFields.handle = req.body.handle;
  if (req.body.company) profileFields.company = req.body.company;
  if (req.body.website) profileFields.website = req.body.website;
  if (req.body.location) profileFields.location = req.body.location;
  if (req.body.bio) profileFields.bio = req.body.bio;
  if (req.body.status) profileFields.status = req.body.status;
  if (req.body.githubUsername) profileFields.githubUsername = req.body.githubUsername;

  if (typeof req.body.skills !== 'undefined') {
    profileFields.skills = req.body.skills.split(',');
  }

  profileFields.social = {};
  if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
  if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    });

    if (profile) {
      try {
        // Update profile
        const updatedUser = await Profile.findOneAndUpdate({
          user: req.user.id,
        }, {
            $set: profileFields,
          }, {
            new: true,
          });

        res.json(updatedUser);
      } catch (e) {
        log.error(e);
      }
    } else {
      try {
        const handle = await Profile.findOne({
          handle: profileFields.handle,
        });

        if (handle) {
          errors.handle = 'That handle already exists!';
          res.status(400).json(errors);
        }

        try {
          const newProfile = await new Profile(profileFields).save();
          res.json(newProfile);
        } catch (e) {
          log.error(e);
        }
      } catch (e) {
        log.error(e);
      }
    }
  } catch (e) {
    res.send(404);
    log.error(e);
  }
});

// @route   POST api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.post('/experience', passport.authenticate('jwt', {
  session: false,
}), async (req, res) => {
  const {
    errors,
    isValid,
  } = validateExperienceInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    });
    if (profile) {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };

      profile.experience.unshift(newExp);
      const updatedProfile = await profile.save();
      return res.json(updatedProfile);
    }
    res.status(404).json({
      noprofile: 'There is no profile for this user',
    });
  } catch (e) {
    log.error(e);
  }
});

// @route   POST api/profile/education
// @desc    Add aducation to profile
// @access  Private
router.post('/education', passport.authenticate('jwt', {
  session: false,
}), async (req, res) => {
  const {
    errors,
    isValid,
  } = validateEducationInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    });
    if (profile) {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldOfStudy: req.body.fieldOfStudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };

      profile.education.unshift(newEdu);
      const updatedProfile = await profile.save();
      return res.json(updatedProfile);
    }
    res.status(404).json({
      noprofile: 'There is no profile for this user',
    });
  } catch (e) {
    log.error(e);
  }
});

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', passport.authenticate('jwt', {
  session: false,
}), async (req, res) => {
  const errors = {};

  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    });

    const expLength = profile.experience.length;
    const updatedExp = profile.experience.filter(exp => !(exp.id === req.params.exp_id));

    if (expLength === updatedExp.length) {
      errors.noChange = 'No experience with this id found!';
      return res.send(errors);
    }
    profile.experience = updatedExp;

    try {
      const savedProfile = await profile.save();
      res.status(200).send(savedProfile);
    } catch (e) {
      errors.cantSave = 'Profile can not be saved!';
      log.error(e);
      res.status(500).send(errors);
    }
  } catch (e) {
    errors.noprofile = 'Proifle not found!';
    res.status(404).json(errors);
  }
});

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:edu_id', passport.authenticate('jwt', {
  session: false,
}), async (req, res) => {
  const errors = {};

  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    });

    const eduLength = profile.education.length;
    const updatedEdu = profile.education.filter(edu => !(edu.id === req.params.edu_id));

    if (eduLength === updatedEdu.length) {
      errors.noChange = 'No education with this id found!';
      return res.send(errors);
    }
    profile.education = updatedEdu;

    try {
      const savedProfile = await profile.save();
      res.status(200).send(savedProfile);
    } catch (e) {
      errors.cantSave = 'Profile can not be saved!';
      log.error(e);
      res.status(500).send(errors);
    }
  } catch (e) {
    errors.noprofile = 'Proifle not found!';
    res.status(404).json(errors);
  }
});

// @route   DELETE api/profile/
// @desc    Delete user and profile
// @access  Private
router.delete('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ success: true });
  } catch (e) {
    res.status(500).send('Something went wrong');
  }
});

module.exports = router;
