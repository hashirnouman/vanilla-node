// creating and exporting configuration variabels

// container for the environments
var environments = {};

environments.staging = {
  httpPort: 3000,
  httpsPort:3001,
  envName: "staging",
};

environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
};

// determied which environment was passed as a command line argument
var currentEnviroment =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLocaleLowerCase()
    : "";

// Checkt that the current key is one of the enviroments above if not set it to staging
var enviromentToExport =
  typeof environments[currentEnviroment] == "object"
    ? environments[currentEnviroment]
    : environments.staging;

// Export the module
module.exports = enviromentToExport;

