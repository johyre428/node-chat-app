const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const publicPath = path.join(__dirname, '../public');
const PORT = process.env.PORT || 3000;

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  socket.on('createMessage', (message) => {
    console.log('createMessage', message);
    
    io.emit('newMessage', {
      ...message,
      createdAt: new Date().getTime()
    });
  });
  
  socket.on('disconnect', () => {
    console.log('User was disconnected!');
  });
});

server.listen(PORT, () => console.log('Listening to port: ' + PORT));
