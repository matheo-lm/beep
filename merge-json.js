const fs = require('fs');
const path = require('path');

const feedDir = path.join(__dirname, 'feeds');
const outputFile = path.join(feedDir, 'merged.json');

if (!fs.existsSync(feedDir)) {
  console.error(`Directory ${feedDir} does not exist.`);
  process.exit(1);
}

let mergedData = {};

fs.readdirSync(feedDir).forEach(file => {
  if (path.extname(file) === '.json') {
    const filePath = path.join(feedDir, file);
    try {
      const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      mergedData = { ...mergedData, ...fileData };
    } catch (error) {
      console.error(`Error parsing JSON from file ${filePath}:`, error);
    }
  }
});

fs.writeFileSync(outputFile, JSON.stringify(mergedData, null, 2), 'utf8');
console.log('JSON files merged successfully.');