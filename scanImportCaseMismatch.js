const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, 'src'); // change if needed
const importRegex = /(?:import|require)\s.*?['"](.+?)['"]/g;

function getActualCasing(filePath) {
  const parts = filePath.split(path.sep);
  let currentPath = path.isAbsolute(filePath) ? path.sep : '';

  for (const part of parts) {
    const dir = currentPath || '.';
    try {
      const entries = fs.readdirSync(dir);
      const actual = entries.find(e => e.toLowerCase() === part.toLowerCase());
      if (!actual) return null;
      currentPath = path.join(currentPath, actual);
    } catch (e) {
      return null;
    }
  }
  return currentPath;
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const dir = path.dirname(filePath);
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    let importPath = match[1];

    if (importPath.startsWith('.') || importPath.startsWith('/')) {
      const resolvedPath = path.resolve(dir, importPath);
      const withExtension = ['.js', '.jsx', '.ts', '.tsx']
        .map(ext => resolvedPath + ext)
        .find(fs.existsSync) || resolvedPath;

      const actualPath = getActualCasing(withExtension);

      if (actualPath && actualPath !== withExtension) {
        console.warn(
          `⚠️ Case mismatch in ${filePath}:\n  Imported as: ${importPath}\n  Actual path: ${path.relative(projectRoot, actualPath)}\n`
        );
      }
    }
  }
}

function walk(dir) {
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (/\.(js|jsx|ts|tsx)$/.test(item)) {
      scanFile(fullPath);
    }
  }
}

console.log('🔍 Scanning for import casing mismatches...\n');
walk(projectRoot);
console.log('✅ Done.');
