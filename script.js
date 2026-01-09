// Get references to chat container and input textarea
const chat = document.getElementById("chat");
const input = document.getElementById("input");

// Store chat history for context
const chatHistory = [];

// OpenAI API configuration
const OPENAI_API_KEY = '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';
// Using a different CORS proxy service
const CORS_PROXY = 'https://api.codetabs.com/v1/proxy?quest=';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

// Function to send user message to OpenAI and get response
async function sendMessage() {
  const userText = input.value.trim(); // Get and trim user input
  if (!userText) return; // Do nothing if input is empty
  input.value = ""; // Clear input box

  appendMessage("user", userText); // Show user message in chat
  chatHistory.push({ role: "user", parts: [{ text: userText }] }); // Add user message to context

  // Show typing indicator
  const typingIndicator = document.createElement("div");
  typingIndicator.className = "typing";
  typingIndicator.id = "typing-indicator";
  typingIndicator.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  chat.appendChild(typingIndicator);
  chat.scrollTop = chat.scrollHeight;

  try {
    // Call OpenAI API through CORS proxy
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(OPENAI_URL)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant."
          },
          {
            role: "user",
            content: userText
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });
    
    // Remove typing indicator
    const indicator = document.getElementById("typing-indicator");
    if (indicator) indicator.remove();
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);
      throw new Error(`OpenAI API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log("OpenAI API Response:", data);
    
    // Extract the response text
    let reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    appendMessage("assistant", reply); // Show assistant reply in chat
    chatHistory.push({ role: "assistant", parts: [{ text: reply }] }); // Add assistant reply to context
  } catch (error) {
    // Remove typing indicator in case of error
    const indicator = document.getElementById("typing-indicator");
    if (indicator) indicator.remove();
    
    // Handle errors gracefully
    appendMessage(
      "assistant",
      "Error: Could not get response from OpenAI API. " + (error.message || "")
    );
    console.error(error);
  }
}

// Function to append a message to the chat container
function appendMessage(role, text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${role}`;
  messageDiv.textContent = text;
  chat.appendChild(messageDiv);
  chat.scrollTop = chat.scrollHeight;
}

// Add event listener for Enter key in the input field
document.getElementById('input').addEventListener('keypress', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Add event listener for send button
document.getElementById('send-button').addEventListener('click', sendMessage);

// Expose sendMessage function to global scope for button onclick
window.sendMessage = sendMessage;
