const socket = io("http://localhost:5000");

const username = localStorage.getItem("username");

if (!username) location.href = "index.html";

socket.emit("user_online", username);

// load messages
fetch("http://localhost:5000/messages")
.then(res=>res.json())
.then(data=>{
  data.forEach(m=>addMessage(m.sender,m.message));
});

// load users
function loadUsers(){
fetch("http://localhost:5000/users")
.then(res=>res.json())
.then(data=>{
  const ul=document.getElementById("users");
  ul.innerHTML="";
  data.forEach(u=>{
    const li=document.createElement("li");
    li.className="list-group-item";
    li.innerText = u.username + (u.is_online ? " 🟢" : " 🔴");
    ul.appendChild(li);
  });
});
}

loadUsers();

socket.on("refresh_users", loadUsers);

// send message
function sendMessage(){
  const msg=document.getElementById("message").value;
  socket.emit("send_message",{sender:username,message:msg});
  document.getElementById("message").value="";
}

// receive
socket.on("receive_message",(data)=>{
  addMessage(data.sender,data.message);
});

// typing
document.getElementById("message").addEventListener("input",()=>{
  socket.emit("typing",username);
});

socket.on("typing",(name)=>{
  document.getElementById("typing").innerText = name+" typing...";
});

socket.on("stop_typing",()=>{
  document.getElementById("typing").innerText="";
});

// UI
function addMessage(sender,message){
  const div=document.createElement("div");
  div.className="message "+(sender===username?"me":"other");
  div.innerText=sender+": "+message;
  document.getElementById("chat-box").appendChild(div);
}