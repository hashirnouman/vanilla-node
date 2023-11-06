// helpers for various tasks

// dependecies

const crypto = require("crypto");
const config = require("./config");

// container for helpers
const helpers = {};

// create SHA256 hash
helpers.hash = function (str) {
  if (typeof str == "string" && str.length > 0) {
    const hash = crypto
      .createHmac("sha256", config.hashingSecret)
      .update(str)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

// parse JSON to string to and object without throwing error
helpers.parseJsonToObject = function (str) {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (error) {
    return {};
  }
};

helpers.createRandomStrings = function (stringLength) {
  stringLength =
    typeof stringLength == "number" && stringLength > 0 ? stringLength : false;
  if (stringLength) {
    // all possible charaters that can go into string
    let possibleCharacter = "abcdefghijklomnpqrstuvwxyz1234567890";

    // Start the final string
    var str = "";
    for (i = 1; i <= stringLength; i++) {
      // get radom from the possibelCharater
      let randomCharater = possibleCharacter.charAt(
        Math.floor(Math.random() * possibleCharacter.length)
      );
      // Append the random character to final string
      str += randomCharater;
    }
    return str;
  } else {
    return false;
  }
};
// exporting the helper module
module.exports = helpers;
