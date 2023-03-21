const imgNames = [
  "react",
  "vue",
  "python",
  "angular",
  "c",
  "css",
  "html",
  "mongo",
  "java",
  "javascript",
];

const wrongTries = document.querySelector("[data-wrong-tries]");
const userName = document.querySelector("[data-user-name]");

function showCards() {
  // make a div that will take the full screen so that the player can't
  // click on the cards while the game is starting
  const protectionLayer = document.createElement("div");
  protectionLayer.setAttribute("data-protection-layer", "");
  protectionLayer.style.cssText = `
    position: absolute;
    inset: 0;
  `;
  document.body.append(protectionLayer);

  // show the player all cards for 2 seconds
  document.querySelectorAll(".card").forEach((card) => {
    card.dataset.active = false;
    card.dataset.done = false;
    card.classList.add("animating");
    setTimeout(() => {
      card.classList.remove("animating");
    }, 1000);
  });

  // remove protection layer after game has started
  setTimeout(() => {
    document.querySelector("[data-protection-layer]").remove();
  }, 1500);
}

function createPopup() {
  function createConfirmBtn() {
    const confirmBtn = document.createElement("button");
    confirmBtn.setAttribute("type", "submit");
    confirmBtn.className = "confirm";

    confirmBtn.textContent = "Start Game";

    confirmBtn.addEventListener("click", (e) => {
      e.target.parentElement.remove();
      document.body.classList.remove("blur");
    });

    return confirmBtn;
  }

  const popUp = document.createElement("div");
  popUp.classList.add("pop-up");

  const confirmBtn = createConfirmBtn();

  popUp.append(confirmBtn);

  return popUp;
}

function createUserNamePopup() {
  function createTextField() {
    const userNameInput = document.createElement("input");
    userNameInput.className = "pop-up__input";
    userNameInput.id = "username";

    const label = document.createElement("label");
    label.setAttribute("for", "username");
    label.textContent = "Enter your name:";

    return [userNameInput, label];
  }

  const popUp = createPopup();
  const confirmBtn = popUp.querySelector(".confirm");

  confirmBtn.addEventListener("click", showCards);
  confirmBtn.addEventListener("click", (e) => {
    const userNm = e.target.parentElement.querySelector(".pop-up__input").value;
    if (userNm) {
      userName.textContent = userNm;
      sessionStorage.setItem("userName", userNm);
    } else {
      userName.textContent = "anonymous";
    }
  });

  const [userNameInput, label] = createTextField();

  userNameInput.onkeyup = ({ key }) =>
    key === "Enter" ? confirmBtn.click() : null;

  popUp.prepend(label);
  label.after(userNameInput);

  return popUp;
}

function checkCard(e) {
  const card = e.target.classList.contains("card")
    ? e.target
    : e.target.closest(".card");

  card.dataset.active = "true";

  // show animation
  card.classList.add("animating");

  const clickedCards = document.querySelectorAll(
    ".card[data-active=true][data-done=false]"
  );

  if (clickedCards.length !== 2) return;

  if (clickedCards[0].dataset.cardType === clickedCards[1].dataset.cardType) {
    clickedCards[0].dataset.done = "true";
    clickedCards[1].dataset.done = "true";
    // play success sound
    document.querySelector("[data-audio=success]").play();
    checkForWin();
  } else {
    wrongTries.textContent++;
    clickedCards[0].dataset.active = "false";
    clickedCards[1].dataset.active = "false";
    // play failure sound
    document.querySelector("[data-audio=failure]").play();

    const allCards = document.querySelectorAll(".card");
    allCards.forEach((card) => {
      card.style.pointerEvents = "none";
    });
    // remove animation after a delay
    setTimeout(() => {
      clickedCards[0].classList.remove("animating");
      clickedCards[1].classList.remove("animating");
      allCards.forEach((card) => {
        card.style.pointerEvents = "all";
      });
    }, 1000);
  }
}

function createCards() {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < imgNames.length; i++) {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-card-type", imgNames[i]);
    card.setAttribute("data-active", "false");
    card.setAttribute("data-done", "false");

    // prevent player from cheating by dragging the card which will
    // cause the browser to show it
    card.ondragstart = (e) => e.preventDefault();

    const frontFace = document.createElement("div");
    frontFace.classList.add("face", "front");

    const backFace = document.createElement("div");
    backFace.classList.add("face", "back");

    const img = document.createElement("img");
    img.setAttribute("alt", `${imgNames[i]} logo`);
    img.setAttribute("src", `images/${imgNames[i]}.webp`);

    backFace.append(img);

    card.append(frontFace);
    card.append(backFace);

    card.addEventListener("click", checkCard);

    frag.append(card);
  }
  return frag.children;
}

function addCardsRandomly() {
  const cardsContainer = document.querySelector(".cards");
  cardsContainer.innerHTML = "";
  const cards = [...createCards(), ...createCards()];
  const addedCardsIndexes = [];

  for (let i = 0; i < cards.length; i++) {
    let randIndex;

    // get a new random number that haven't been selected before
    do randIndex = Math.floor(Math.random() * cards.length);
    while (addedCardsIndexes.includes(randIndex));

    // update the indexes list to keep track of added cards
    addedCardsIndexes.push(randIndex);

    cardsContainer.append(cards[randIndex]);
  }
}

function checkForWin() {
  const userWon = Array.from(document.querySelectorAll(".card")).every(
    (card) => card.dataset.done === "true"
  );

  if (!userWon) return;

  const popUp = createPopup();

  const message = document.createElement("p");
  message.className = "win-message";
  message.innerHTML = `
  Congratulations!! You Won with 
  <span>${wrongTries.textContent}</span>
  Wrong tries.
  `;

  popUp.prepend(message);

  wrongTries.textContent = "0";

  popUp.querySelector(".confirm").addEventListener("click", () => {
    addCardsRandomly();
    showCards();
  });

  document.body.append(popUp);
  document.body.classList.add("blur");
}

addCardsRandomly();
if (sessionStorage.getItem("userName")) {
  showCards();
  userName.textContent = sessionStorage.getItem("userName");
} else {
  const popUp = createUserNamePopup();

  document.body.append(popUp);
  document.body.classList.add("blur");

  popUp.querySelector(".pop-up__input").focus();
}
