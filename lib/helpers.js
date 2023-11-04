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
// exporting the helper module
module.exports = helpers;
