import fs from 'fs';
import path from 'path';

const mapFile = path.resolve('../cloudinary_map.json');
const srcDir = path.resolve('../rajdyaan-frontend/src');

const imageMap = JSON.parse(fs.readFileSync(mapFile, 'utf-8'));

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  for (const [localPath, cloudUrl] of Object.entries(imageMap)) {
    // Escape the localPath for regex, but usually a simple replaceAll is enough if we match exact strings
    // E.g., "/images/logo.png" -> "https://res.cloudinary.com/..."
    if (content.includes(localPath)) {
      content = content.split(localPath).join(cloudUrl);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated: ${filePath}`);
  }
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (stat.isFile() && /\.(js|jsx|ts|tsx|css|scss)$/.test(file)) {
      replaceInFile(fullPath);
    }
  }
}

console.log('Starting frontend replacement...');
scanDir(srcDir);
console.log('Replacement complete!');
