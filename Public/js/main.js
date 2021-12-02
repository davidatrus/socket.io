
const chatMessages = document.querySelector('.chat-messages');
const ChatForm = document.getElementById('chat-form'); 
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users')

//Get userName and room from the url
const {username,room } = Qs.parse(location.search,{
    ignoreQueryPrefix: true // dont get the =, & signs jsut the strings 
});



const socket = io();

//join chat room
socket.emit('joinRoom',{username, room});

//get the rooms and users
socket.on('roomUsers', ({room, users})=>{
    outputRoomName(room);
    outputUsers(users);
});

//message from server
socket.on('message', message =>{
    console.log(message);
    outputMessage(message);

    //auto scroll
    chatMessages.scrollTop = chatMessages.scrollHeight;
});


//submitting message
ChatForm.addEventListener('submit', e=> {
    e.preventDefault();

    const msg= e.target.elements.msg.value; //getting msg from chat.html has an id of 'msg' .value gets the acctual string

    //emmitting a message to server 
   socket.emit('chatMessage', msg);

   //clearing text field
   e.target.elements.msg.value = '';
   e.target.elements.msg.focus();
});

//output message to DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username}<span> ${message.time}</span></p>
    <p class="text">
       ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//Add roomname to DOM 
function outputRoomName(room){
    roomName.innerText = room;
}
//add users to DOM
function outputUsers(users){
    userList.innerHTML= `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}