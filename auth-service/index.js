const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./User');

const app = express();
const PORT = process.env.PORT_ONE || 7070;

app.use(express.json());

mongoose.connect("mongodb://localhost/auth-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, () => {
    console.log('Auth-Service DB connected');
});

//Register
app.post('/auth/service', async(req, res) => {
    const {name, email, password} = req.body;
    const userExistence  = await User.findOne({email});
    if (userExistence) {
        return res.json({message: 'User already exists'});
    } else {
        const newUser = new User({
            name,
            email,
            password
        });
        newUser.save();
        return res.json(newUser);
    }
});

//Login
app.post('/auth/login', async(req, res) => {
    const {email, password} = req.body;
    const user  = await User.findOne({email});
    if (!user) {
        return res.json({message: 'User doesnot exists'});
    } else {
        //Check if the paswword is right or wrong
        if(password !== user.password) {
            return res.json({message: 'Password Incorrect'});
        }
        const payload = {
            email,
            name: user.name,
        }

        jwt.sign(payload, "secret", (err, token) => {
            if(err) console.log(err);
            else {
                return res.json({jsonToken: token});
            }
        });
    }
});


app.listen(PORT, () => {
    console.log(`Auth-Service at Port ${PORT}`)
});
