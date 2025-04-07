import { cos_sim, pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@latest/dist/transformers.js';

let data = [];
let model;


async function handleInput() {
  if (!model) {
    model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  if (!data.length) {  // Changed condition to check array length
    try {

      const response = await fetch(`/public/data.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      data = await response.json();
    } catch (error) {
      console.error('Error loading data:', error);
      data = [];  // Reset to empty array if fetch fails
    }
  }

  const userInput = document.getElementById("input").value;
  console.log(`User input: ${userInput}`);
  if (!userInput) {
    console.error("User input is empty");
    return;
  }
  showMessage("You", userInput);
  const emb = await model(userInput, { pooling: "mean", quantized: true });

  let bestScore = 0;
  let bestResponse = "Sorry, I don't understand.";

  for (const item of data) {
    const score = cos_sim(emb.data, item.embedding);


    if (score > 0.8 && score > bestScore) {
      bestScore = score;
      bestResponse = item.response;
    }
  }
  console.log(`Best score for item: ${bestScore}`);

  // Add artificial delay between 1-2 seconds
  const delay = Math.random() * 1000 + 1000;
  console.log(`Artificial delay: ${delay} ms`);
  await new Promise(resolve => setTimeout(resolve, delay));

  showMessage("Patient", bestResponse);
}

function showMessage(sender, text) {
  const chat = document.getElementById("chat");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender.toLowerCase()}-message`;

  const content = document.createElement("div");
  content.className = "message-content";
  content.textContent = text;

  messageDiv.appendChild(content);
  chat.appendChild(messageDiv);
  chat.scrollTop = chat.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById("input");
  const text = input.value.trim(); // Add trim() to remove whitespace
  if (text.length > 0) { // Check for non-empty string after trimming
    handleInput();
    input.value = '';
    input.focus();
  } else {
    alert("Please enter a message.");
  }
  input.focus();
}

document.getElementById("send").addEventListener("click", sendMessage);
document.getElementById("input").addEventListener("keypress", function (e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});
// Initialize the chat with a welcome message
showMessage("Patient", "Hello, who are you?");
handleInput();