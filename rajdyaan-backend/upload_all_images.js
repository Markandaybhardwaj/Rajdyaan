import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const frontendImagesDir = path.resolve('../rajdyaan-frontend/public/images');
const mapFile = path.resolve('../cloudinary_map.json');

async function uploadImage(filePath, fileName) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: 'rajdyaan/assets',
        public_id: path.parse(fileName).name,
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
  });
}

async function run() {
  console.log('Starting Cloudinary Upload...');
  if (!fs.existsSync(frontendImagesDir)) {
    console.error('Images directory not found:', frontendImagesDir);
    return;
  }

  const files = fs.readdirSync(frontendImagesDir);
  const imageMap = {};

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext)) {
      const filePath = path.join(frontendImagesDir, file);
      try {
        console.log(`Uploading ${file}...`);
        const url = await uploadImage(filePath, file);
        imageMap[`/images/${file}`] = url;
        console.log(`Success: ${url}`);
      } catch (err) {
        console.error(`Failed to upload ${file}:`, err);
      }
    }
  }

  fs.writeFileSync(mapFile, JSON.stringify(imageMap, null, 2));
  console.log(`\nUpload complete! Map saved to ${mapFile}`);
}

run();
