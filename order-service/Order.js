const mongoose = require('mongoose');
const Schema = mongoose.Schema();

const OrderSchema =  mongoose.Schema({
    description: String,
    products: [ {
        product_id: String,
    } ],
    user: String,
    total_price: Number,
    created_at: {
        type: Date,
        default: Date.now(),
    }
   
});

module.exports = Order = mongoose.model("order", OrderSchema);
