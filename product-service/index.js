const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const amqp = require('amqplib');
const Product = require('./Product');
const isAuthenticated  = require('../isAuthenticated');

const app = express();
const PORT = process.env.PORT_ONE || 8080;
let order;
let channel, connection;

app.use(express.json());

mongoose.connect("mongodb://localhost/product-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, () => {
    console.log('Product-Service DB connected');
});

async function connect() {
    const ampqServer = "amqp://localhost:5672";
    connection = await amqp.connect(ampqServer);
    channel = await connection.createChannel();
    await channel.assertQueue("PRODUCT");
}

connect();

// Create a new product
app.post('/product/create', isAuthenticated, async (req, res) => {
    const { name, description, price } = req.body;
    const newProduct = new Product({
        name,
        description,
        price,
    });
    newProduct.save();
    return res.json(newProduct);
});

// User sends a list of product IDs to buy a product
// Creating an order with those products and a total value of sum of product's prices
app.post('/product/buy', isAuthenticated, async (req, res) => {
    const {ids } = req.body;
    const products = await Product.find({_id: {$in: ids}});
    const queue = 'ORDER';
    channel.sendToQueue(queue, Buffer.from(JSON.stringify({
        products,
        userEmail: req.user.email,
    })));
    channel.consume('PRODUCT', (data) => {
        console.log('CONSUMING PRODUCT QUEUE');
        order = JSON.parse(data.content);
        channel.ack(data);
    });
    return res.json(order);
});


app.listen(PORT, () => {
    console.log(`Product-Service at Port ${PORT}`)
});
