/*
 * Name: Hitesh Boinpally
 * Date: April 22, 2020
 * Section: CSE 154 AC
 *
 * This is the JS to implement the UI for my Blackjack game, generating the actual
 * game functions and switching between the various views.
 * All images from publicdomainvectors.org
 * https://publicdomainvectors.org/en/playing-cards-clipart-free-download.
 */

"use strict";

(function() {
  const CARD_TURN_TIME = 1000;
  const BLACKJACK = 21;
  const SOFT_17 = 17;

  let deck;
  let usedCards = new Set();
  let playerTotal = 0;
  let dealerTotal = 0;

  window.addEventListener("load", init);

  /** Initializes the page, adding Event Listeners where necessary. */
  function init() {
    getDeck();
    id("begin").addEventListener("click", clickBegin);
    id("continue").addEventListener("click", clickContinue);
    id("hit").addEventListener("click", clickHit);
    id("stand").addEventListener("click", clickStand);
    id("quit").addEventListener("click", clickQuit);
    id("curr-bet").addEventListener("keyup", enterBet);
  }

  /** Fetches the deck to be used for the game */
  function getDeck() {
    fetch("deck")
      .then(checkStatus)
      .then(resp => resp.json())
      .then(data => {deck = data;})
      .catch(handleError);
  }

  /** Switches the page from the menu-view to the game-view with updated money */
  function clickBegin() {
    id("menu-view").classList.add("hidden");
    id("game-view").classList.remove("hidden");
    let input = qs('input[type="radio"]:checked').value;
    id("money-ct").textContent = input;
    id("curr-bet").setAttribute("max", input);
  }

  /**
   * Begins an initial round, dealing initial hands. Also locks the curr-bet
   * input. Toggles the game buttons.
   */
  function clickContinue() {
    toggleGame();
    id("curr-bet").setAttribute("readonly", "");

    setDealerHand();
    setPlayerHand();
  }

  /**
   * Executes a single player hit, automatically ends the player's turn if they
   * blackjac or bust
   */
  function clickHit() {
    hit(id("player-hand"), true);
    if (playerTotal >= BLACKJACK) {
      clickStand();
    }
  }

  /**
   * Ends the player's turn, removing their ability to hit or stand. Starts and
   * ends the dealer's turn.
   */
  function clickStand() {
    id("hit").removeEventListener("click", clickHit);
    id("stand").removeEventListener("click", clickStand);
    dealerTurn();
  }

  /**
   * Switches from the game-view to the end-view. updates and displays
   * the final money.
   */
  function clickQuit() {
    id("game-view").classList.add("hidden");
    id("end-view").classList.remove("hidden");
    id("final-money").textContent = "$" + id("money-ct").textContent;
  }

  /**
   * Begins the game if the "Enter" key was clicked while inside the curr-bet
   * input. Locks the curr-bet input.
   * @param {eventObject} e - the Event object
   */
  function enterBet(e) {
    if (e.code === "Enter") {
      e.currentTarget.setAttribute("readonly", "");
      clickContinue();
    }
  }

  /** Sets the dealer's hand, with one facedown card and one open card */
  function setDealerHand() {
    let dealerHand = id("dealer-hand");

    let facedownCard = gen("img");
    facedownCard.classList.add("card");
    facedownCard.src = "img/facedown-card.webp";
    facedownCard.alt = "facedown card";
    let timer1 = setTimeout(function() {
      dealerHand.removeChild(dealerHand.firstElementChild);
      dealerHand.appendChild(facedownCard);
      clearTimeout(timer1);
    }, CARD_TURN_TIME);

    let timer2 = setTimeout(function() {
      hit(dealerHand, false);
      clearTimeout(timer2);
    }, 2 * CARD_TURN_TIME);
  }

  /**
   * Sets the player's initial hand of two cards. Ends the player's turn if
   * they have a blackjack.
   */
  function setPlayerHand() {
    let playerHand = id("player-hand");

    setTimeout(function() {
      playerHand.removeChild(playerHand.firstElementChild);
    }, CARD_TURN_TIME);

    let count = 0;
    let timerId = setInterval(function() {
      if (count >= 2) {
        clearInterval(timerId);
      } else {
        hit(playerHand, true);
        count++;
        if (playerTotal === BLACKJACK) {
          clickStand();
        }
      }
    }, CARD_TURN_TIME);
  }

  /**
   * Goes through the dealer's turn and decides the winner. Flips the facedown
   * card, and adds cards until a score of 17 or more is reached. Then decides
   * who won and updates the bank accordingly.
   */
  function dealerTurn() {
    let dealerHand = id("dealer-hand");
    dealerHand.replaceChild(getRandomCard(false), dealerHand.firstElementChild);

    let timerId = setInterval(function() {
      if (dealerTotal < SOFT_17) {
        hit(dealerHand, false);
      } else {
        clearInterval(timerId);
        fetchResult();
      }
    }, CARD_TURN_TIME);
  }

  /**
   * Compares the playerTotal and dealerTotal to figure out whether the player
   * should win or lose (or tie).
   */
  function fetchResult() {
    fetch("/result/" + playerTotal + "/" + dealerTotal)
      .then(checkStatus)
      .then(resp => resp.text())
      .then(updateBank)
      .catch(handleError);
  }

  /**
   * Uses the given string to figure out if the player should win, lose, or
   * keep money. Resets the game. Toggles game buttons.
   * @param {string} result - the result message of the turn
   */
  function updateBank(result) {
    id("result").textContent = result;

    let currBet = id("curr-bet").value;
    let bank = id("money-ct");
    let currMoney = parseInt(bank.textContent);

    if (currBet !== "0" || currBet !== "") {
      currBet = parseInt(currBet);
      if (result.includes("Congrats")) {
        currMoney += currBet;
      } else if (result.includes("Whoops")) {
        currMoney -= currBet;
      }
    }

    bank.textContent = currMoney;
    id("curr-bet").setAttribute("max", currMoney);

    let timerID = setTimeout(function() {
      if (currMoney <= 0) {
        clickQuit();
      } else {
        toggleGame();
        resetGame();
      }
      clearTimeout(timerID);
    }, 1.5 * CARD_TURN_TIME);
  }

  /**
   * Toggles between "continue" and "hit", as well as the "quit" and "stand"
   * buttons.
   */
  function toggleGame() {
    id("continue").classList.toggle("hidden");
    id("hit").classList.toggle("hidden");
    id("quit").classList.toggle("hidden");
    id("stand").classList.toggle("hidden");
  }

  /**
   * Resets the current game. Empties usedCards, sets playerTotal and
   * dealerTotal back to zero, as well as re-opening the curr-bet input and
   * game option buttons. Empties the player and dealer's hands as well.
   */
  function resetGame() {
    id("result").textContent = "";
    playerTotal = 0;
    dealerTotal = 0;
    usedCards.clear();
    id("curr-bet").removeAttribute("readonly");
    id("hit").addEventListener("click", clickHit);
    id("stand").addEventListener("click", clickStand);

    let blankCard = gen("div");
    blankCard.classList.add("empty-card");
    let blankCard2 = blankCard.cloneNode();

    emptyHand("player", blankCard);
    emptyHand("dealer", blankCard2);
  }

  /**
   * Empties the given hand and replaces it with a blank card.
   * @param {string} person - either "player" or "dealer" to indicate who's hand to empty.
   * @param {divElementObject} blankCard - the blank card to append to the emptied hand.
   */
  function emptyHand(person, blankCard) {
    let hand = id(person + "-hand");
    hand.innerHTML = "";
    hand.appendChild(blankCard);
  }

  /**
   * Adds a random card to the given hand.
   * @param {object} hand - The hand to add the new card to.
   * @param {boolean} isPlayer - True if the hand is the player's, false if it is the dealer's.
   */
  function hit(hand, isPlayer) {
    hand.appendChild(getRandomCard(isPlayer));
  }

  /**
   * Generates and returns a random card from the heart's suit. Updates the playerTotal or
   * dealerTotal by the new card's value (which total is determined by given isPlayer).
   * @param {boolean} isPlayer - True if the card is the player's, false if it is the dealer's.
   * @returns {object} Random card from the heart's suit.
   */
  function getRandomCard(isPlayer) {
    let newCard = gen("img");
    newCard.classList.add("card");

    let index = Math.floor(Math.random() * deck.length);
    let cardName = deck[index].name;
    while (usedCards.has(cardName)) {
      index = Math.floor(Math.random() * deck.length);
      cardName = deck[index].name;
    }
    usedCards.add(cardName);

    if (isPlayer) {
      playerTotal += deck[index].value;
    } else {
      dealerTotal += deck[index].value;
    }

    newCard.src = "img/" + deck[index].suit + "/" + cardName + ".svg";
    newCard.alt = cardName + " of hearts";
    return newCard;
  }

  /**
   * Lets the user know there was some sort of error
   * @param {object} resp - the error response
   */
  function handleError(resp) {
    id("result").textContent = "Looks like something went wrong!" + resp;
  }

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} response - response to check for success/error
   * @return {object} - valid response if response was successful, otherwise rejected
   *                    Promise result
   */
  function checkStatus(response) {
    if (response.ok) {
      return response;
    } else {
      throw Error("Error in request: " + response.statusText);
    }
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id (null if none).
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Returns a generated HTML Element object associated to the given tagName.
   * @param {string} tagName - the tag of the desired HTML object
   * @returns {object} ELement object associated to given tagName.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

  /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} selector - CSS query selector string.
   * @returns {object} first element matching the selector in the DOM tree (null if none)
   */
  function qs(selector) {
    return document.querySelector(selector);
  }
})();