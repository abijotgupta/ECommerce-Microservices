const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
const Order = require('./Order');
const isAuthenticated  = require('../isAuthenticated');

const app = express();
const PORT = process.env.PORT_ONE || 9090;
let channel, connection;

app.use(express.json());

mongoose.connect("mongodb://localhost/order-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, () => {
    console.log('Order-Service DB connected');
});

async function connect() {
    const ampqServer = "amqp://localhost:5672";
    connection = await amqp.connect(ampqServer);
    channel = await connection.createChannel();
    await channel.assertQueue("ORDER");
}

function createOrder(products, userEmail) {
    let total_price = 0;
    let totalProducts = products.length;
    for(let product = 0; product < totalProducts; product++) {
        total_price += products[product].price;
    }
    const newOrder = new Order({
        products,
        user: userEmail,
        total_price,
    });
    newOrder.save();
    return newOrder;
}

connect().then(() => {
    channel.consume("ORDER", (data) => {
        const {products, userEmail} = JSON.parse(data.content);
        console.log('CONSUMING ORDER QUEUE');
        const newOrder = createOrder(products, userEmail);
        channel.ack(data);
        channel.sendToQueue('PRODUCT', Buffer.from(JSON.stringify({newOrder})));
    });
});

app.listen(PORT, () => {
    console.log(`Order-Service at Port ${PORT}`)
});
