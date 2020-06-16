const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const { generateMessage, generateLocationMessage } = require('./utils/message');
const isRealString = require('./utils/validation');
const Users = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
const PORT = process.env.PORT || 3000;

let users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and Room Name are required!');
    }
    
    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);
    
    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the Chat App!'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
    
    callback();
  });
  
  socket.on('createMessage', (message, callback) => {
    const user = users.getUser(socket.id);
    
    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }
    
    callback();
  })
  
  socket.on('createLocationMessage', (coords) => {
    const user = users.getUser(socket.id);
    
    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords));
    }
  })
  
  socket.on('disconnect', () => {
    const user = users.removeUser(socket.id);
    
    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left`))
    }
  });
});

server.listen(PORT, () => console.log('Listening to port: ' + PORT));
