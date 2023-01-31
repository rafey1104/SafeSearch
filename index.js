const express = require('express');
const app = express();


app.listen(5001, () =>{
    console.log("server 1 running");
});
const fs = require('fs');
const path = require('path');
var amqp = require('amqplib/callback_api');



const multer = require('multer');
const { Storage } = require('@google-cloud/storage');

const str = new Storage({
  projectId: "node-safesearch",
  keyfilename: "APIKey.json"
});
const bucket = str.bucket('safesearch_bucket');
  


const images = fs.readdirSync('./images');


amqp.connect('amqp://localhost', (error0, connection) => {
  if (error0) {
    throw error0;
    
  }

  connection.createChannel((error1, channel) => {
    if (error1) {
      throw error1;
    }

    const queue = 'images';
    channel.assertQueue(queue, {
      durable: false
    });

    
    const image = images[Math.floor(Math.random() * images.length)];
    const imagePath = path.join('./images', image);
    const imageLocation = `https://storage.googleapis.com/safesearch_bucket/${image}`;
    
    bucket.file(imagePath).createWriteStream({
      resumable: false,
      gzip: true
    });    
    channel.sendToQueue(queue, Buffer.from(imageLocation));
    console.log(`[x] Sent ${imageLocation}`);
    
  });
});
