const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'components');
const appFile = path.join(__dirname, 'src', 'App.tsx');

function removeRounding(content) {
    // Replaces rounded, rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-2xl, rounded-3xl, rounded-full, rounded-t-xl, etc.
    return content.replace(/\brounded(?:-[a-zA-Z0-9]+)*\b/g, 'rounded-none');
}

function removeIcons(content) {
    // 1. Find all imported icons from lucide-react
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g;
    let match;
    let iconsToRemove = [];
    
    while ((match = importRegex.exec(content)) !== null) {
        const icons = match[1].split(',').map(i => i.trim()).filter(Boolean);
        iconsToRemove.push(...icons);
    }
    
    if (iconsToRemove.length === 0) return content;
    
    // 2. Remove their JSX usages. e.g. <IconName ... /> or <IconName>...</IconName>
    let newContent = content;
    iconsToRemove.forEach(icon => {
        // Matches <IconName ... /> or <IconName />
        const selfClosingRegex = new RegExp(`<${icon}\\b[^>]*/>`, 'g');
        newContent = newContent.replace(selfClosingRegex, '');
        
        // Matches <IconName>...</IconName>
        const openCloseRegex = new RegExp(`<${icon}\\b[^>]*>.*?</${icon}>`, 'gs');
        newContent = newContent.replace(openCloseRegex, '');
    });
    
    // 3. Remove the import statement
    newContent = newContent.replace(importRegex, '');
    
    return newContent;
}

function processFile(filePath, isApp = false) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Always remove rounding
    content = removeRounding(content);
    
    // Only remove icons from components, NOT from App.tsx 
    // (since App.tsx holds the sidebar and config card where icons are permitted)
    if (!isApp) {
        content = removeIcons(content);
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Processed ${path.basename(filePath)}`);
}

// Process components
const components = fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx'));
components.forEach(c => {
    processFile(path.join(srcDir, c), false);
});

// Process App.tsx
processFile(appFile, true);

console.log('UI refactoring complete.');
