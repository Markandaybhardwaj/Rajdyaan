const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src', function(filePath) {
  if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace `${API_URL}/v1/...` with `${API_URL}/...`
  content = content.replace(/\$\{API_URL\}\/v1\//g, '${API_URL}/');
  
  // Replace `${apiUrl}/v1/...` with `${apiUrl}/...`
  content = content.replace(/\$\{apiUrl\}\/v1\//g, '${apiUrl}/');

  // Replace `${BASE}/v1/...` with `${BASE}/...`
  content = content.replace(/\$\{BASE\}\/v1\//g, '${BASE}/');

  // Replace `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/v1/`
  // with `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/`
  content = content.replace(
    /\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/localhost:5000\/api'\}\/v1\//g,
    "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/"
  );
  
  // Replace API_URL defaults that point to '.../api' instead of '.../api/v1'
  content = content.replace(
    /process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/localhost:5000\/api'/g,
    "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'"
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed:', filePath);
  }
});
