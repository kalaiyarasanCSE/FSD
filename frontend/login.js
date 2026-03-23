async function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:5000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (res.status === 200) {
    alert("Registered! Login now");
  } else {
    document.getElementById("msg").innerText = "User exists";
  }
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (data.success) {
    localStorage.setItem("username", username);
    window.location.href = "chat.html";
  } else {
    document.getElementById("msg").innerText = "Invalid login";
  }
}