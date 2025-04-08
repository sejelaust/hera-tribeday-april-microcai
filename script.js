import { cos_sim, pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@latest/dist/transformers.js';

let data = [];
let model;


async function handleInput() {
  const userInput = document.getElementById("input").value;
  document.getElementById("input").value = ''; // Move clearing here
  
  if (!model) {
    model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  if (!data.length) {  // Changed condition to check array length
    try {
      let base_url = "/"
      if (location.hostname.includes("github.io")) {
        // Check if it's a user/organization GitHub Pages domain
        if (location.hostname.includes("pages.github.io")) {
          // For auto-generated domains like laughing-adventure-w65qw2l.pages.github.io
          base_url = "/";
        } else {
          // For user/organization domains like rasgaard.github.io/convai-actions-demo
          base_url = "/hera-tribeday-april-microcai/";
        }
      }

      const response = await fetch(`${base_url}public/data.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      data = await response.json();
    } catch (error) {
      console.error('Error loading data:', error);
      data = [];  // Reset to empty array if fetch fails
    }
  }

  console.log(`User input: ${userInput}`);
  if (!userInput) {
    console.error("User input is empty");
    return;
  }
  showMessage("You", userInput);
  
  // Show typing indicator before processing
  showTypingIndicator();
  
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

  // Remove typing indicator before showing the response
  removeTypingIndicator();
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

// Add typing indicator while response is being generated
function showTypingIndicator() {
  const chat = document.getElementById("chat");
  const indicatorDiv = document.createElement("div");
  indicatorDiv.className = "message patient-message typing-indicator";
  indicatorDiv.id = "typing-indicator";

  const content = document.createElement("div");
  content.className = "message-content";
  content.innerHTML = "<span></span><span></span><span></span>";

  indicatorDiv.appendChild(content);
  chat.appendChild(indicatorDiv);
  chat.scrollTop = chat.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById("typing-indicator");
  if (indicator) {
    indicator.remove();
  }
}

// Track if we're currently processing a message
let isProcessingMessage = false;

function sendMessage() {
  const input = document.getElementById("input");
  const text = input.value.trim(); // Add trim() to remove whitespace
  
  // Prevent sending if already processing or empty message
  if (isProcessingMessage) {
    return;
  }
  
  if (text.length > 0) { // Check for non-empty string after trimming
    isProcessingMessage = true;
    document.getElementById("send").disabled = true; // Disable button while processing
    
    handleInput()
      .then(() => {
        isProcessingMessage = false;
        document.getElementById("send").disabled = false;
      })
      .catch(error => {
        console.error("Error handling input:", error);
        showMessage("System", "Sorry, there was an error processing your message.");
        isProcessingMessage = false;
        document.getElementById("send").disabled = false;
      });
    
    input.focus();
  } else {
    alert("Please enter a message.");
  }
}

function clearChat() {
  const chat = document.getElementById("chat");
  chat.innerHTML = '';
  showMessage("Patient", "Hello, who are you?");
}

// Create and add clear button
function addClearButton() {
  const inputContainer = document.querySelector(".input-container");
  const clearButton = document.createElement("button");
  clearButton.id = "clear";
  clearButton.textContent = "Clear Chat";
  clearButton.addEventListener("click", clearChat);
  inputContainer.appendChild(clearButton);
}

document.getElementById("send").addEventListener("click", sendMessage);
document.getElementById("input").addEventListener("keypress", function (e) {
  if (e.key === 'Enter' && !isProcessingMessage) {
    sendMessage();
  }
});

// Initialize the chat with a welcome message
window.addEventListener("DOMContentLoaded", () => {
  showMessage("Patient", "Hello, who are you?");
  addClearButton();
});
