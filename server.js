const express =  require ('express');
const path = require('path');
const http = require('http'); //need to access http directly to be able to use socket.io
const socketio = require('socket.io');
const formatMessage = require('./util/messages');
const {userJoin, getCurrentUser, userLeave,getRoomUsers} = require('./util/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

//setting static folder
app.use(express.static(path.join(__dirname, 'public')));
const adminName= '3313 Admin';

//run socket when client connects, welcoming current user
io.on('connection', socket => {
    socket.on('joinRoom',({username, room})=>{
       const user = userJoin(socket.id,username,room);

        socket.join(user.room);


        socket.emit('message',  formatMessage(adminName,'welcome to 3313 chat app'));

        //send user & room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });

        //broadcasting users connect to specfic room
        socket.broadcast.to(user.room).emit('message', formatMessage(adminName,`${user.username} has joined the chat`));
    });

//listening for  chatmessage
socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username,msg));
});
//broadcast when user disconnects
socket.on('disconnect',() =>{
 const user = userLeave(socket.id);
    
    if(user){
        io.to(user.room).emit('message',formatMessage(adminName,`${user.username} has left the chat`)); 
         //send user & room info
         io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    }
   });
});

const port = 3000 || process.env.port; //use 3000 as port of if we have env named port use that.

server.listen(port, () => console.log(`server running on port ${port}`));