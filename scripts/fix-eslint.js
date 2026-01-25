#!/usr/bin/env node

/**
 * Script to automatically fix common ESLint warnings
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Starting automated ESLint cleanup...\n');

// Step 1: Run ESLint auto-fix on all TypeScript files
console.log('Step 1: Running ESLint auto-fix...');
try {
    execSync('npx eslint --fix "src/**/*.{ts,tsx}" --max-warnings=9999', {
        stdio: 'inherit',
        cwd: process.cwd()
    });
    console.log('✅ ESLint auto-fix completed\n');
} catch (error) {
    console.log('⚠️  ESLint auto-fix completed with warnings\n');
}

// Step 2: Fix common patterns with regex
console.log('Step 2: Fixing common patterns...');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix unescaped apostrophes in JSX
    const apostropheRegex = /(<[^>]*>)([^<]*)'([^<]*<\/[^>]+>)/g;
    if (apostropheRegex.test(content)) {
        content = content.replace(/(<[^>]*>)([^<]*)(?<!&apos;)'(?!apos;)([^<]*<\/[^>]+>)/g, '$1$2&apos;$3');
        modified = true;
    }

    // Fix unescaped quotes in JSX
    const quoteRegex = /(<[^>]*>)([^<]*)"([^<]*<\/[^>]+>)/g;
    if (quoteRegex.test(content)) {
        content = content.replace(/(<[^>]*>)([^<]*)(?<!&quot;)"(?!quot;)([^<]*<\/[^>]+>)/g, '$1$2&quot;$3');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }
    return false;
}

function walkDir(dir, callback) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (!filePath.includes('node_modules') && !filePath.includes('.next')) {
                walkDir(filePath, callback);
            }
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            callback(filePath);
        }
    });
}

let fixedFiles = 0;
walkDir(path.join(process.cwd(), 'src'), (filePath) => {
    if (fixFile(filePath)) {
        fixedFiles++;
        console.log(`  Fixed: ${path.relative(process.cwd(), filePath)}`);
    }
});

console.log(`✅ Fixed ${fixedFiles} files with pattern replacements\n`);

console.log('🎉 Cleanup complete! Run "npm run lint" to check remaining warnings.');
