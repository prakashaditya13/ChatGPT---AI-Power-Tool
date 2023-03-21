import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

// A loader will show when Chat bot is finding the solution from an api
function loader(element) {
  element.textContent = "";
  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

// Show solution by one character
function typeTextAnimate(element, text) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateChatID() {
  const timestamp = Date.now();
  const randomNumber = Math.random();

  const complexRandomNum = randomNumber.toString(16);

  return `id-${timestamp}-${complexRandomNum}`;
}

function chatAlternateStripe(isBotAi, value, uniqueID) {
  return `
      <div class='wrapper ${isBotAi && "ai"}'>
        <div class='chat'>
          <div class='profile'>
            <img
              src='${isBotAi ? bot : user}'
              alt='${isBotAi ? "bot" : "user"}'
            />
          </div>
          <div class='${isBotAi ? 'botMessage' : 'message'}' id=${uniqueID}>
            ${value}
          </div>
        </div>
      </div>
      
      `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);
  // Generate the chat strip for user

  chatContainer.innerHTML += chatAlternateStripe(false, data.get("prompt"));

  form.reset();

  //Generate chat strip for bot
  const uniqueId = generateChatID();
  chatContainer.innerHTML += chatAlternateStripe(true, "", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageContainer = document.getElementById(uniqueId);

  loader(messageContainer);

  //fetch data from the server

  const response = await fetch("http://localhost:5000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageContainer.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parseData = data.bot.trim();
    typeTextAnimate(messageContainer, parseData);
  } else {
    const err = await response.text();
    messageContainer.innerHTML = "Something went wrong!!";
    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
