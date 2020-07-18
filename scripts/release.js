const fs = require("fs");
const path = require("path");

const readme = "./README.md";
const overview = "./docs/md/overview.md";
const app = "./docs/js/app.js";
const tutorial = "./docs/md/tutorial.md";
const package = "./package.json";
const main = "h3";
const otherFiles = ["vdom", "store", "router"];
const framework = "framework";
const files = [main, framework, ...otherFiles];

const cnRegexp = /\/\*\*\n \* H3(.|\n)+?\*\//m;
const hlaRegexp = /\/\*\*\* High Level API \*\*\*\/(.|\n)+/m;

const readJs = (file) => fs.readFileSync(`./${file}.js`, "utf8");
const writeJs = (file, data) => fs.writeFileSync(`./${file}.js`, data);

const updateCopyright = (file) => {
  let data = readJs(file);
  const notice = data.match(/\/\*\*((.|\n|\r)+?)\*\//gm)[0];
  const newNotice = notice
    .replace(/v\d+\.\d+\.\d+/, `v${pkg.version}`)
    .replace(/\"[^"]+\"/, `"${pkg.versionName}"`)
    .replace(/Copyright \d+/, `Copyright ${new Date().getFullYear()}`);
  data = data.replace(notice, newNotice);
  writeJs(file, data);
};

const pkg = JSON.parse(fs.readFileSync(package, "utf8"));

// Update copyright notices
files.forEach(updateCopyright);

// Bundle other files into main
let fdata = fs.readFileSync(`./${framework}.js`, "utf8");
const cn = fdata.match(cnRegexp)[0];
const hla = fdata.match(hlaRegexp)[0];
fdata = [
  cn,
  ...otherFiles.map((f) => readJs(f).replace(cnRegexp, "")),
  hla,
].join("\n\n");
writeJs(main, fdata);

// Update README.md
let readmeData = fs.readFileSync(readme, "utf8");
readmeData = readmeData.replace(/v\d+\.\d+\.\d+/, `v${pkg.version}`);
readmeData = readmeData.replace(/v\d+\.\d+\.\d+/, `v${pkg.version}`);
readmeData = readmeData.replace(
  /Download v\d+\.\d+\.\d+ \([^)]+\)/,
  `Download v${pkg.version} (${pkg.versionName})`
);
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
[app, tutorial].forEach(updateCode);

// Update package.json
const packageData = JSON.parse(fs.readFileSync(package, "utf8"));
packageData.version = pkg.version;
fs.writeFileSync(package, JSON.stringify(packageData, null, 2));
