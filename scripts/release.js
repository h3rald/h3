const fs = require("fs");
const path = require("path");

const [vNumber, vLabel] = fs.readFileSync("VERSION", "utf8").trim().split(":");

const readme = "./README.md";
const overview = "./docs/md/overview.md";
const app = "./docs/js/app.js";
const tutorial = "./docs/md/tutorial.md";
const package = "./package.json";

// Update README.md
let readmeData = fs.readFileSync(readme, "utf8");
readmeData = readmeData.replace(/v\d+\.\d+\.\d+/, `v${vNumber}`);
readmeData = readmeData.replace(
  /Download v\d+\.\d+\.\d+ \([^)]+\)/,
  `Download v${vNumber} (${vLabel})`
);
fs.writeFileSync(readme, readmeData);

// Remove badges and copy to overview.md
const overviewData = readmeData.replace(/[^\*]+\*\*\*\s+/m, "");
fs.writeFileSync(overview, overviewData);

// Update app.js and tutorial.md
const updateCode = (file) => {
  let data = fs.readFileSync(file, "utf8");
  data = data.replace(/v\d+\.\d+\.\d+/, `v${vNumber}`);
  data = data.replace(/“.+“/, `“${vLabel}“`);
  fs.writeFileSync(file, data);
};
updateCode(app);
updateCode(tutorial);

// Update package.json
const packageData = JSON.parse(fs.readFileSync(package, "utf8"));
packageData.version = vNumber;
fs.writeFileSync(package, JSON.stringify(packageData, null, 2));
