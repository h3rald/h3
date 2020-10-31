const fs = require('fs');
const path = require('path');
const terser = require('terser');

const readme = './README.md';
const overview = './docs/md/overview.md';
const app = './docs/js/app.js';
const tutorial = './docs/md/tutorial.md';
const package = './package.json';
const h3 = './h3.js';
const h3min = './h3.min.js';
const h3map = './h3.js.map';

const pkg = JSON.parse(fs.readFileSync(package, 'utf8'));

// Update h3.js

let h3Data = fs.readFileSync(h3, 'utf8');
const notice = h3Data.match(/\/\*\*((.|\n|\r)+?)\*\//gm)[0];
const newNotice = notice
  .replace(/v\d+\.\d+\.\d+/, `v${pkg.version}`)
  .replace(/\"[^"]+\"/, `"${pkg.versionName}"`)
  .replace(/Copyright \d+/, `Copyright ${new Date().getFullYear()}`);
h3Data = h3Data.replace(notice, newNotice);
fs.writeFileSync(h3, h3Data);
const minified = terser.minify(h3Data, {
  sourceMap: { filename: 'h3.js', url: 'h3.js.map' },
});
fs.writeFileSync(h3min, minified.code);
fs.writeFileSync(h3map, minified.map);

// Update README.md
let readmeData = fs.readFileSync(readme, 'utf8');
readmeData = readmeData.replace(/v\d+\.\d+\.\d+/, `v${pkg.version}`);
readmeData = readmeData.replace(/Download v\d+\.\d+\.\d+ \([^)]+\)/, `Download v${pkg.version} (${pkg.versionName})`);
readmeData = readmeData.replace(/v\d+\.\d+\.\d+\/h3\.min\.js/, `v${pkg.version}/h3.min.js`);
fs.writeFileSync(readme, readmeData);

// Remove badges and copy to overview.md
const overviewData = readmeData.replace(/[^\*]+\*\*\*\s+/m, '');
fs.writeFileSync(overview, overviewData);

// Update app.js and tutorial.md
const updateCode = (file) => {
  let data = fs.readFileSync(file, 'utf8');
  data = data.replace(/v\d+\.\d+\.\d+/, `v${pkg.version}`);
  data = data.replace(/“.+“/, `“${pkg.versionName}“`);
  fs.writeFileSync(file, data);
};
updateCode(app);
updateCode(tutorial);

// Update package.json
const packageData = JSON.parse(fs.readFileSync(package, 'utf8'));
packageData.version = pkg.version;
fs.writeFileSync(package, JSON.stringify(packageData, null, 2));
