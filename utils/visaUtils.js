// Define a function that generates a random CVV code in javascript
exports.generateCVV = () => {
  // Initialize an empty string to store the CVV code
  let cvv = "";
  // Loop 3 times
  for (let i = 0; i < 3; i++) {
    // Generate a random digit from 0 to 9 and append it to the CVV code
    cvv += Math.floor(Math.random() * 10);
  }
  // Return the CVV code as a string
  return cvv;
};

// Define a function that generates a random expiry date in javascript
exports.generateExpiryDate = () => {
  // Get the current year as a four-digit number
  let year = new Date().getFullYear();
  // Generate a random year between the current year and the next five years and convert it to a string
  year = (year + Math.floor(Math.random() * 6)).toString();
  // Generate a random month between 1 and 12 and convert it to a string with leading zero if needed
  let month = (Math.floor(Math.random() * 12) + 1).toString().padStart(2, "0");
  // Generate a random day between 1 and the last day of the month and convert it to a string with leading zero if needed
  let day = (
    Math.floor(Math.random() * new Date(year, month, -1).getDate()) + 1
  )
    .toString()
    .padStart(2, "0");

  // Return the expiry date as a string in YYYY-MM-DD format
  return year + "-" + month + "-" + day;
};
