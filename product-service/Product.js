const mongoose = require('mongoose');
const Schema = mongoose.Schema();

const ProductSchema =  mongoose.Schema({
    name: String,
    description: String,
    price: String,
    created_at: {
        type: Date,
        default: Date.now()
    }
});

module.exports = Product = mongoose.model("product", ProductSchema);
