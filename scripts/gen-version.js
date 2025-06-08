const fs = require('fs');
const { execSync } = require('child_process');

const hash = execSync('git rev-parse HEAD').toString().trim();
const date = execSync('git log -1 --format=%cI').toString().trim();
const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
const version = require('../package.json').version;

const content = {
  branch,
  version,
  hash,
  date,
};

fs.writeFileSync('./version.json', JSON.stringify(content, null, 2));
console.log('version.json generated');
