const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'components');

function removeRounding(content) {
    return content.replace(/\brounded(?:-[a-zA-Z0-9]+)*\b/g, 'rounded-none');
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    content = removeRounding(content);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Processed ${path.basename(filePath)}`);
}

const components = fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx'));
components.forEach(c => {
    processFile(path.join(srcDir, c));
});

console.log('Rounding removed.');
