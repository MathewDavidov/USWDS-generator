// PLACE -- AFTER SCRIPT NAME FOR ARGUMENTS IF USING "npm run uswds-gen"

const { program } = require("commander");
const fs = require("fs");
const path = require("path");
const process = require("process");
const config = require("../src/config");
const generator = require("../src/generator");

program.version("0.2");

program
  .option("-i, --input <directory path>", "specified input directory path")
  .option("-o, --output <directory path>", "specified output directory path to be created")
  .option("-f, --framework <framework>", "specified framework (default is React)")
  .option("-v, --verbose", "verbose mode logs configuration");
program.parse(process.argv);
/**
 * Configuration object
 * @typedef {Object} configuration - object that contains returned properties from configure()
 * @typedef {Function} configure - takes in program object and returns another object
 * @returns {Object} - object with properties given by configure based off of what properties were undefined or not in program
 * @param {Object} program - object passed in to configure input/output paths and framework specified
 */
const configuration = config.configure(program);

if (configuration.isVerbose) {
  console.log(configuration);
}

try {
  // Get names of all files in directory
  fs.readdir(configuration.inputDirectoryPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      throw err;
    }
    console.log(files);

    files.forEach((file) => {
      // If a file in the directory ends in .njk
      if (file.name.substring(file.name.lastIndexOf(".")) === ".njk") {
        // Read file in the path given
        fs.readFile(path.join(configuration.inputDirectoryPath, file.name), (error, data) => {
          if (error) {
            throw error;
          }

          // The name of the component is the name of the file
          let componentName =
            // Uppercase the first letter of the file name
            file.name.charAt(0).toUpperCase() +
            // And then add the rest of the file name up until the '.'
            file.name.substring(1, file.name.lastIndexOf("."));

          /**
           * PascalCase the component name if need be
           * If the name of the file includes a '-',
           * store a substring starting from '-' up until the end of the file name
           */
          if (componentName.includes("-")) {
            const sub = componentName.substring(componentName.lastIndexOf("-"));

            // Then, uppercase the letter right after the `-` and append the rest of characters
            const rpl = sub.charAt(1).toUpperCase() + sub.substring(2);
            console.log("sub is ", sub);
            console.log("rpl is ", rpl);

            // Finally, use replace() to update componentName that no longer contains the hypen
            componentName = componentName.replace(sub, rpl);
          }
          /**
           * Contents of the file
           * @type {string}
           */
          const content = String(data);
          /**
           * Generates component file in a specified framework
           * @typedef {Function} generator
           * @returns {void}
           * @param {string} componentName - the name the component will have inside of the file
           * @param {string} content - contents of the file that was read
           * The third parameter is the what the actual name of the file will be,
           * retrieved from the name of the file that has the basic HTML
           * @param {string} configuration.outputDirectoryPath - path where component files will be created in the specified framework
           */
          generator.generator(
            componentName,
            content,
            `${file.name.substring(0, file.name.lastIndexOf("."))}.jsx`,
            configuration.outputDirectoryPath
          );
        });
      }
    });
  });
} catch (e) {
  console.log(e);
}
