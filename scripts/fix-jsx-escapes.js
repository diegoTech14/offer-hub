const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing common ESLint issues...\n');

const srcDir = path.join(__dirname, '..', 'src');
let totalFixed = 0;

// Common fixes
const fixes = [
    {
        name: 'Escape apostrophes in JSX',
        pattern: /(?<=>)([^<]*?)(?<!&apos;)'(?!apos;)([^<]*?)(?=<)/g,
        replacement: "$1&apos;$2",
        test: (content) => content.includes("'") && content.includes('<')
    },
    {
        name: 'Escape quotes in JSX',
        pattern: /(?<=>)([^<]*?)(?<!&quot;)"(?!quot;)([^<]*?)(?=<)/g,
        replacement: '$1&quot;$2',
        test: (content) => content.includes('"') && content.includes('<')
    }
];

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let originalContent = content;

    for (const fix of fixes) {
        if (fix.test(content)) {
            const newContent = content.replace(fix.pattern, fix.replacement);
            if (newContent !== content) {
                content = newContent;
                modified = true;
            }
        }
    }

    if (modified && content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        totalFixed++;
        console.log(`✓ ${path.relative(process.cwd(), filePath)}`);
    }
}

function walkDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                walkDirectory(fullPath);
            }
        } else {
            processFile(fullPath);
        }
    }
}

walkDirectory(srcDir);

console.log(`\n✅ Fixed ${totalFixed} files`);
console.log('Running ESLint to check remaining issues...\n');
