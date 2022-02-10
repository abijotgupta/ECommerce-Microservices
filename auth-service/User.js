const mongoose = require('mongoose');
const Schema = mongoose.Schema();

const UserSchema =  mongoose.Schema({
    name: String,
    email: String,
    password: String,
    created_at: {
        type: Date,
        default: Date.now()
    }
});

module.exports = User = mongoose.model("user", UserSchema);
