
const fs = require('fs');
const path = require('path');

const feedDir = path.join(__dirname, 'feed');
const outputFile = path.join(feedDir, 'merged.json');

let mergedData = {};

fs.readdirSync(feedDir).forEach(file => {
  if (path.extname(file) === '.json') {
    const filePath = path.join(feedDir, file);
    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    mergedData = { ...mergedData, ...fileData };
  }
});

fs.writeFileSync(outputFile, JSON.stringify(mergedData, null, 2), 'utf8');
console.log('JSON files merged successfully.');