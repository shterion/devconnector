const express = require("express");
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

// Load User model
const User = require('./../../models/User');

router.get('/', (req, res) => {
    res.json({
        msg: "Users"
    });
});

router.post('/register', async (req, res) => {
    try {
        const userExists = await User.findOne({
            email: req.body.email
        });

        if (userExists === undefined || userExists === null) {
            try {
                const avatar = gravatar.url(req.body.email, {
                    s: '200',
                    r: 'pg',
                    d: 'mm'
                });
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, async (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        try {
                            const user = await newUser.save();
                            res.json(user);
                        } catch (error) {
                            console.log(error);

                        }
                    });
                });

            } catch (error) {
                console.log(error);
            }
        } else {
            res.status(400).json({
                email: 'Email already exists!'
            });
        }
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;