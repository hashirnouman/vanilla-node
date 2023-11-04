const fs = require("fs");
const helper = require("./helpers");
const path = require("path");
const lib = {};
lib.baseDir = path.join(__dirname, "/../.data/");

// creating the file
lib.create = function (dir, file, data, callback) {
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "wx",
    function (err, fileDescriptor) {
      if (!err && fileDescriptor) {
        // covert data into string
        const stringData = JSON.stringify(data);

        // write string Data to file
        fs.writeFile(fileDescriptor, stringData, function (err) {
          if (!err) {
            fs.close(fileDescriptor, function (err) {
              if (!err) {
                callback(false);
              } else {
                callback("Erro is closing the file");
              }
            });
          } else {
            callback("Error writing is a file");
          }
        });
      } else {
        callback("Error cannot create file as it exits already");
      }
    }
  );
};

// reading the file

lib.read = function (dir, file, callback) {
  fs.readFile(
    lib.baseDir + dir + "/" + file + ".json",
    "utf8",
    function (err, data) {
      if (!err && data) {
        var parsedData = helper.parseJsonToObject(data);
        callback(false, parsedData);
      } else {
        callback(err, data);
      }
    }
  );
};

lib.update = function (dir, file, data, callback) {
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "r+",
    function (err, fileDescriptor) {
      if (!err && fileDescriptor) {
        // covert data into string
        const stringData = JSON.stringify(data);

        // truncate the file

        fs.truncate(fileDescriptor, function (err) {
          if (!err) {
            // write string Data to file
            fs.writeFile(fileDescriptor, stringData, function (err) {
              if (!err) {
                fs.close(fileDescriptor, function (err) {
                  if (!err) {
                    callback(false);
                  } else {
                    callback("Erro is closing the file");
                  }
                });
              } else {
                callback("Error updating in a file");
              }
            });
          } else {
            callback("Error is truncating the file");
          }
        });
      } else {
        callback("Error cannot open the  file for editing it may not exist");
      }
    }
  );
};
// delete the file
// Delete a file
lib.delete = function (dir, file, callback) {
  // Unlink the file from the filesystem
  fs.unlink(lib.baseDir + dir + "/" + file + ".json", function (err) {
    callback(err);
  });
};
module.exports = lib;
