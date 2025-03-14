const io = require("socket.io-client");
const readline = require("readline");

const socket = io("http://localhost:3000");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt:"> ",
  });

let username = "";

socket.on("connect", () => {
  console.log("Connected to the server");

  rl.question("Enter your username: ", (input) => {
    username = input;
    console.log(`Welcome ${username} to the chat`);
    rl.prompt();

    rl.on("line", (message) => {
        if (message.trim()) {
      socket.emit("message", { username, message });
    }
    });
  });
});

socket.on("message", (data) => {
    const { username: senderUsername, message: senderMassage } = data;
    if (senderUsername !== username) {
    console.log(`${senderUsername}: ${senderMassage}`);
}
    rl.prompt();
});

socket.on("disconnect", () => {
  console.log("Disconnected to the server");
  rl.close();
  process.exit(0);
});

rl.on("SIGINT", () => {
    console.log("\nExiting chat");
    socket.disconnect();
    rl.close();
    process.exit(0);
});