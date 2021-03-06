/*
 * Name: Hitesh Boinpally
 * Date: May 21, 2020
 * Section: CSE 154 AC
 *
 * This is the API to retrieve the deck and turn results of my Blackjack game
 */

"use strict";
const fs = require("fs").promises;
const express = require("express");
const app = express();
const BLACKJACK = 21;
const INVALID_PARAM_ERROR = 400;
const INVALID_PARAM_MSG = "Invalid input was sent";

/** This endpoint sends a JSON object representing a deck of cards */
app.get("/deck", async function(req, res) {
  let deck = await getDeck();
  res.type("json").json(deck);
});

/** This endpoint uses the provided parameters to send back a turn result string */
app.get("/result/:playerTotal/:dealerTotal", function(req, res) {
  try {
    let playerTotal = parseInt(req.params["playerTotal"]);
    let dealerTotal = parseInt(req.params["dealerTotal"]);

    let result = processWinner(playerTotal, dealerTotal);

    res.type("text").send(result);
  } catch (err) {
    res.type("text");
    res.status(INVALID_PARAM_ERROR).send(INVALID_PARAM_MSG);
  }
});

/**
 * Returns a string about whether the player won, lost, or tied against the dealer
 * for the given parameters.
 * @param {int} playerTotal - the player's card total for the turn
 * @param {int} dealerTotal - the dealer's card total for the turn
 * @return {string} - string containing information on who won the round
 */
function processWinner(playerTotal, dealerTotal) {
  let result = "";
  if (playerTotal > BLACKJACK) {
    result = "Whoops! Looks like you busted!";
  } else if (dealerTotal > BLACKJACK || playerTotal > dealerTotal) {
    if (playerTotal === BLACKJACK) {
      result = "Blackjack!"
    } else {
      result = "Congrats! You won!";
    }
  } else if (playerTotal < dealerTotal) {
    result = "Whoops! Looks like you lost!";
  } else {
    result = "Oh well! Looks like it was a tie!";
  }
  return result;
}

/**
 * Reads the current "deck" and returns it as a JSON object
 * @return {object} - returns the deck as a JSON object
 */
async function getDeck() {
  let contents = await fs.readFile("deck.json", "utf8");
  let deck = JSON.parse(contents);

  return deck;
}

app.use(express.static("public"));
const PORT = process.env.PORT || 8000;
app.listen(PORT);