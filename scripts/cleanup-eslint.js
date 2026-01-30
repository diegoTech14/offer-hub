const fs = require('fs');
const path = require('path');

console.log('🧹 Mass ESLint Cleanup Script\n');
console.log('This will fix common ESLint warnings across the entire codebase.\n');

const srcDir = path.join(__dirname, '..', 'src');
let stats = {
    filesProcessed: 0,
    apostrophesFixed: 0,
    quotesFixed: 0,
    unusedVarsCommented: 0,
    totalModified: 0
};

function escapeJSXContent(content) {
    let modified = false;
    let result = content;

    // Fix apostrophes in JSX text content (between tags)
    // Match: >text with ' here<
    const lines = result.split('\n');
    const fixedLines = lines.map(line => {
        // Only process lines that look like JSX content
        if (line.includes('>') && line.includes('<') && line.includes("'")) {
            // Simple heuristic: if line has > followed by text with ' followed by <
            const jsxTextRegex = /(>[^<]*)'([^<]*<)/g;
            if (jsxTextRegex.test(line)) {
                const newLine = line.replace(/(>[^<]*)(?<!&apos;)'(?!apos;)([^<]*<)/g, '$1&apos;$2');
                if (newLine !== line) {
                    stats.apostrophesFixed++;
                    modified = true;
                    return newLine;
                }
            }
        }

        // Fix quotes similarly
        if (line.includes('>') && line.includes('<') && line.includes('"')) {
            const jsxTextRegex = /(>[^<]*)"([^<]*<)/g;
            if (jsxTextRegex.test(line)) {
                const newLine = line.replace(/(>[^<]*)(?<!&quot;)"(?!quot;)([^<]*<)/g, '$1&quot;$2');
                if (newLine !== line) {
                    stats.quotesFixed++;
                    modified = true;
                    return newLine;
                }
            }
        }

        return line;
    });

    if (modified) {
        result = fixedLines.join('\n');
    }

    return { content: result, modified };
}

function processFile(filePath) {
    if (!filePath.endsWith('.tsx')) return false;

    const content = fs.readFileSync(filePath, 'utf8');
    const { content: newContent, modified } = escapeJSXContent(content);

    if (modified) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        stats.totalModified++;
        const relativePath = path.relative(process.cwd(), filePath);
        console.log(`✓ ${relativePath}`);
        return true;
    }

    return false;
}

function walkDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== '__tests__') {
                walkDirectory(fullPath);
            }
        } else {
            stats.filesProcessed++;
            processFile(fullPath);
        }
    }
}

console.log('Processing files...\n');
walkDirectory(srcDir);

console.log(`\n📊 Statistics:`);
console.log(`   Files processed: ${stats.filesProcessed}`);
console.log(`   Files modified: ${stats.totalModified}`);
console.log(`   Apostrophes fixed: ${stats.apostrophesFixed}`);
console.log(`   Quotes fixed: ${stats.quotesFixed}`);
console.log(`\n✅ Phase 1 complete!`);
