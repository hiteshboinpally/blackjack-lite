# Blackjack Lite API Documentation
The Blackjack Lite API provides the deck of cards for the Blackjack game, and also processes turns
and their results.

## Get the Deck of cards to use
**Request Format:** /deck

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Returns an array of JSON objects representing cards, each of which have a
name, suit, and value.


**Example Request:** /deck

**Example Response:**
```json
[
  {
    "name": "two-of-hearts",
    "suit": "hearts",
    "value": 2
  },
  {
    "name": "three-of-hearts",
    "suit": "hearts",
    "value": 3
  },
  ...
]
```

**Error Handling:**
- N/A

## Turn Result
**Request Format:** /result/:playerTotal/:dealerTotal

**Request Type:** GET

**Returned Data Format**: Plain Text

**Description:** Given valid integer playerTotal and dealerTotal, this will return a plain text
about whether the player won, lost, or tied.

**Example Request:** /result/:21/:18

**Example Response:**
*Fill in example response in the {}*

```
Congrats! You won!
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If passed in an invalid pony name, returns an error with the message: `Invalid input was sent`
