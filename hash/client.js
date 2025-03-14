const io = require("socket.io-client");
const readline = require("readline");
const crypto = require("crypto"); // Import the crypto module for hashing

const socket = io("http://localhost:3000");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

let username = "";

// Function to create a hash of the message
function createHash(message) {
  return crypto.createHash("sha256").update(message).digest("hex");
}

socket.on("connect", () => {
  console.log("Connected to the server");

  rl.question("Enter your username: ", (input) => {
    username = input;
    console.log(`Welcome ${username} to the chat`);
    rl.prompt();

    rl.on("line", (message) => {
      if (message.trim()) {
        const messageHash = createHash(message); // Create a hash of the message
        socket.emit("message", { username, message, messageHash }); // Send message with hash
      }
    });
  });
});

socket.on("message", (data) => {
  const { username: senderUsername, message: senderMessage, messageHash } = data;

  // Check if the server is modifying messages
  if (messageHash === undefined) {
    console.log("⚠️   warning : the message may have been changed during transmission!");
} 

  if (senderUsername !== username) {
    console.log(`${senderUsername}: ${senderMessage}`);
  }

  rl.prompt();
});

socket.on("disconnect", () => {
  console.log("Disconnected from the server");
  rl.close();
  process.exit(0);
});

rl.on("SIGINT", () => {
  console.log("\nExiting chat");
  socket.disconnect();
  rl.close();
  process.exit(0);
});