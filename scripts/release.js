const fs = require("fs");
const path = require("path");

const readme = "./README.md";
const overview = "./docs/md/overview.md";
const app = "./docs/js/app.js";
const tutorial = "./docs/md/tutorial.md";
const package = "./package.json";

const pkg = JSON.parse(fs.readFileSync(package, "utf8"));

// Update README.md
let readmeData = fs.readFileSync(readme, "utf8");
readmeData = readmeData.replace(/v\d+\.\d+\.\d+/, `v${pkg.version}`);
readmeData = readmeData.replace(
  /Download v\d+\.\d+\.\d+ \([^)]+\)/,
  `Download v${pkg.version} (${pkg.versionName})`
);
readmeData = readmeData.replace(/### Can I download(\n|.)+/gm, '');
fs.writeFileSync(readme, readmeData);

// Remove badges and copy to overview.md
const overviewData = readmeData.replace(/[^\*]+\*\*\*\s+/m, "");
fs.writeFileSync(overview, overviewData);

// Update app.js and tutorial.md
const updateCode = (file) => {
  let data = fs.readFileSync(file, "utf8");
  data = data.replace(/v\d+\.\d+\.\d+/, `v${pkg.version}`);
  data = data.replace(/“.+“/, `“${pkg.versionName}“`);
  fs.writeFileSync(file, data);
};
updateCode(app);
updateCode(tutorial);

// Update package.json
const packageData = JSON.parse(fs.readFileSync(package, "utf8"));
packageData.version = pkg.version;
fs.writeFileSync(package, JSON.stringify(packageData, null, 2));
