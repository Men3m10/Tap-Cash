# Tap-Cash-App
Smart e-wallet 

A RESTful API for an e-wallet platform that can be integrated with mobile or web e-shop applications.

# Technologies
- Node.js
- Express
- MongoDB
- MVC pattern

# Features
- Users are divided into two roles: parent and child
- Parent users have full access to the app and can manage their children's accounts
- Parent users can control all transactions and preferences of their children
- Users can send and receive money from other parent users or from their children
- Users can generate a Visa card with the Luhn algorithm
# The Luhn algorithm is a simple checksum formula used to validate various identification numbers
- Visa cards can be used to pay bills, shop online or add money to the wallet balance
- Visa cards expire after one minute and the money is refunded to the user
- Users can view all their transactions and Visa cards
- Complex data is stored and retrieved using MongoDB
- Users can register and log in using JWT authentication
- Modern JavaScript features (ES6, ES7) are used

# Security
- The app has several security measures, such as:
  - Preventing HTTP parameter pollution
  - Sanitizing data input and output
  - Handling errors gracefully
  - Protecting against CSRF attacks
  - Thwarting brute-force attempts

