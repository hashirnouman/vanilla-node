/*
 * Request Handlers
 *
 */

// Dependencies
var _data = require("./data");
var helpers = require("./helpers");

// Define all the handlers
var handlers = {};

// Ping
handlers.ping = function (data, callback) {
  callback(200);
};

// Not-Found
handlers.notFound = function (data, callback) {
  callback(404);
};

// Users
handlers.users = function (data, callback) {
  var acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the users methods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function (data, callback) {
  // Check that all required fields are filled out
  var firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  var lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  var phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  var tosAgreement =
    typeof data.payload.tosAgreement == "boolean" &&
    data.payload.tosAgreement == true
      ? true
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;
    handlers._tokens.verifyToken(token, phone, function (isValid) {
      if (isValid) {
        // Make sure the user doesnt already exist
        _data.read("users", phone, function (err) {
          if (err) {
            // Hash the password
            var hashedPassword = helpers.hash(password);

            // Create the user object
            if (hashedPassword) {
              var userObject = {
                firstName: firstName,
                lastName: lastName,
                phone: phone,
                hashedPassword: hashedPassword,
                tosAgreement: true,
              };

              // Store the user
              _data.create("users", phone, userObject, function (err) {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { Error: "Could not create the new user" });
                }
              });
            } else {
              callback(500, { Error: "Could not hash the user's password." });
            }
          } else {
            // User alread exists
            callback(400, {
              Error: "A user with that phone number already exists",
            });
          }
        });
      } else {
        callback(403, { errorMessage: "Invalid token" });
      }
    });
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};

// Required data: phone
// Optional data: none
// @TODO Only let an authenticated user access their object. Dont let them access anyone elses.
handlers._users.get = function (data, callback) {
  // check validity of phone
  let phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    let token =
      typeof data.headers.token == "string" ? data.headers.token : false;
    handlers._tokens.verifyToken(token, phone, function (isValid) {
      if (isValid) {
        _data.read("users", phone, function (err, data) {
          if (!err && data) {
            // remove the hased password before returning the response
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404, { message: "User not found" });
          }
        });
      } else {
        callback(403, { errorMessage: "Invalid token" });
      }
    });
  } else {
    callback(400, { message: "Error missing phone number" });
  }
};

// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO Only let an authenticated user up their object. Dont let them access update elses.
handlers._users.put = function (data, callback) {
  // Check for required field
  var phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;
  // Check for optional fields
  var firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  var lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  // Error if phone is invalid
  if (phone) {
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;
    handlers._tokens.verifyToken(token, phone, function (isValid) {
      if (isValid) {
        if (firstName || lastName || password) {
          _data.read("users", phone, function (err, userData) {
            if (!err && userData) {
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }
              //   store the data to file
              _data.update("users", phone, userData, function (err) {
                if (!err) {
                  callback(200, { message: "data update successfully" });
                } else {
                  console.log(err);
                  callback(500, {
                    errorMessage: "Could not update the user ",
                  });
                }
              });
            } else {
              callback(400, {
                message: "The specified user doesn't exist",
              });
            }
          });
        } else {
          callback(400, { message: "At least one feild is required" });
        }
      } else {
        callback(403, { errMessage: "Invalid token" });
      }
    });
  } else {
    callback(400, { message: "Invalid phone" });
  }
};

// Required data: phone
// @TODO Only let an authenticated user delete their object. Dont let them delete update elses.
// @TODO Cleanup (delete) any other data files associated with the user
handlers._users.delete = function (data, callback) {
  // Check that phone number is valid
  var phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;
    handlers._tokens.verifyToken(token, phone, function (isValid) {
      if (isValid) {
        _data.read("users", phone, function (err, data) {
          if (!err && data) {
            _data.delete("users", phone, function (err) {
              if (!err) {
                callback(200, { message: "User deleted successfully" });
              } else {
                callback(500, { Error: "Could not delete the specified user" });
              }
            });
          } else {
            callback(400, { Error: "Could not find the specified user." });
          }
        });
      } else {
        callback(403, { errMessage: "Invalid token" });
      }
    });
    // Lookup the user
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// tokens
// Users
handlers.tokens = function (data, callback) {
  var acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// containers for tokens sub methods
handlers._tokens = {};

/**
 * required fields phone password
 * option fields none
 * @param {*} data
 * @param {*} callback
 */
handlers._tokens.post = function (data, callback) {
  var phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;

  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  if (phone && password) {
    // Lookup the user who matched the phone
    _data.read("users", phone, function (err, userData) {
      if (!err && userData) {
        // hash the sent password  and compare it with the userData hash passwrd
        const hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPassword) {
          // create token with expiration date of 1 hour
          const token = helpers.createRandomStrings(20);
          const expiration = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            phone: phone,
            token: token,
            expiration: expiration,
          };
          _data.create("tokens", token, tokenObject, function (err) {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { errorMessage: "Failed to generate token" });
            }
          });
        } else {
          callback(400, { errorMessage: "Password mismatch" });
        }
      } else {
        callback(400, { errorMessage: "Could not find the user" });
      }
    });
  }
};

/**
 * required data id
 * optional data none
 * @param {*} data
 * @param {*} callback
 */
handlers._tokens.get = function (data, callback) {
  let id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    // lookup tokens
    _data.read("tokens", id, function (err, tokenData) {
      if (!err && tokenData) {
        // remove the hased password before returning the response

        callback(200, tokenData);
      } else {
        callback(404, { message: "User not found" });
      }
    });
  } else {
    callback(400, { message: "Error missing phone number" });
  }
};

// purpose is to extend the token expiration
// Required data id , extend
// Optional data None
handlers._tokens.put = function (data, callback) {
  let id =
    typeof data.payload.id == "string" && data.payload.id.trim().length == 20
      ? data.payload.id.trim()
      : false;
  let extend =
    typeof data.payload.extend == "boolean" && data.payload.extend == true
      ? true
      : false;
  if (id && extend) {
    // lookup the token service
    _data.read("tokens", id, function (err, tokenData) {
      if (!err && tokenData) {
        if (tokenData.expiration > Date.now()) {
          tokenData.expiration = Date.now() * 1000 * 60 * 60;
          _data.update("tokens", id, tokenData, function (err) {
            if (!err) {
              callback(200, { message: "token time extended succesfully" });
            } else {
              callback(500, { errorMessage: "Unable to update token" });
            }
          });
        } else {
          callback(400, { errorMessage: "Token already expired " });
        }
      } else {
        callback(400, { errorMessage: "Token doesn't exists" });
      }
    });
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};

handlers._tokens.delete = function (data, callback) {
  let id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    // Lookup the user
    _data.read("tokens", id, function (err, tokenData) {
      if (!err && tokenData) {
        _data.delete("tokens", id, function (err) {
          if (!err) {
            callback(200, { message: "token deleted successfully" });
          } else {
            callback(500, { Error: "Could not delete the specified id" });
          }
        });
      } else {
        callback(400, { Error: "Could not find the specified token." });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

handlers._tokens.verifyToken = function (id, phone, callback) {
  _data.read("tokens", id, function (err, tokenData) {
    if (!err) {
      if (tokenData.phone == phone && tokenData.expiration > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// checks
handlers.checks = function (data, callback) {
  var acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, callback);
  } else {
    callback(405);
  }
};

// containers for submethods of checks
handlers._checks = {};

// create checks
handlers._checks.post = function (data, callback) {
  // validate inputs
};
// Export the handlers
module.exports = handlers;
