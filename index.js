const http = require("http");
const url = require("url");
const config = require("./config");
const StringDecoder = require("string_decoder").StringDecoder;
// the server should respond to all requets with a string

const server = http.createServer((req, res) => {
  // get url and parse it
  //   the second value is true which means that we are asking url module to use  querystring module that is inside it to get the query string from url
  let parsedURL = url.parse(req.url, true);

  // get path from url
  let path = parsedURL.pathname;
  let trimmedPath = path.replace(/^\/+|\/+$/g, "");

  //   get query string as an object
  let queryString = parsedURL.query;

  //   get the HTTP method
  let method = req.method.toLocaleLowerCase();

  //   get headers
  let headers = req.headers;

  // get the payload if any
  let decoder = new StringDecoder("utf-8");
  let buffer = "";
  req.on("data", function (data) {
    buffer += decoder.write(data);
  });

  req.on("end", function () {
    buffer += decoder.end();
    // choose the handler the request should go
    var choosenHandler =
      typeof handler[trimmedPath] != "undefined"
        ? router[trimmedPath]
        : handler.notFound;

    //   construct the data object to send to the handler
    var data = {
      trimmedPath: trimmedPath,
      queryString: queryString,
      method: method,
      headers: headers,
      payload: buffer,
    };
    choosenHandler(data, function (statusCode, payload) {
      // use the callback
      statusCode = typeof statusCode == "number" ? statusCode : 200;
      payload = typeof payload == "object" ? payload : {};
      var payloadString = JSON.stringify(payload);
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log("we are returning this response ", statusCode, payloadString);
    });
    // send the response
    // res.end("hello world \n");

    // Logs
    // console.log("request path  " + trimmedPath);
    // console.log("the request method recieved on this path is", method);
    // console.log("query string is ", queryString);
    // console.log("request headers ", headers);
  });
});

// Start the server
server.listen(config.port, () => {
  console.log("http://localhost:" + config.port + " enviroment  " + config.envName);
});

const handler = {};
handler.sample = function (data, callback) {
  // callback a http status code and a payload object
  callback(406, { name: "sample hanlder" });
};

// not found handler
handler.notFound = function (data, callback) {
  callback(404);
};

var router = {
  sample: handler.sample,
};
