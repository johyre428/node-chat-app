const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const generateMessage = require('./utils/message');

const publicPath = path.join(__dirname, '../public');
const PORT = process.env.PORT || 3000;

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  socket.emit('newMessage', generateMessage('Admin', 'Welcome to the Chat App!'));
  socket.broadcast.emit('newMessage', generateMessage('Admin', 'New user joined!'));
  
  socket.on('createMessage', (message, callback) => {
    io.emit('newMessage', generateMessage(message.from, message.text));
    callback('This is from the server.');
    // socket.broadcast.emit('newMessage', {
    //   ...message,
    //   createdAt: new Date().getTime()
    // });
  });
  
  socket.on('disconnect', () => {
    console.log('User was disconnected!');
  });
});

server.listen(PORT, () => console.log('Listening to port: ' + PORT));
