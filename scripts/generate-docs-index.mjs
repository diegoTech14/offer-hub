import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, '../docs');
const OUTPUT_FILE = path.resolve(__dirname, '../src/data/docs-index.json');

const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md'));

const index = [];

files.forEach(file => {
    const content = fs.readFileSync(path.join(DOCS_DIR, file), 'utf8');
    const filename = file.replace('.md', '').toLowerCase().replace(/_/g, '-');
    const docTitle = content.split('\n')[0].replace('# ', '').trim() || file;

    // Split by headers (h2, h3)
    const sections = content.split(/\n(?=##?#? )/);

    sections.forEach((section, idx) => {
        const lines = section.trim().split('\n');
        const headerLine = lines[0];
        const isMainHeader = headerLine.startsWith('# ');
        const isSectionHeader = headerLine.startsWith('## ') || headerLine.startsWith('### ');

        let sectionTitle = docTitle;
        let sectionId = '';

        if (isSectionHeader) {
            sectionTitle = headerLine.replace(/^##?#? /, '').trim();
            sectionId = '#' + sectionTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        }

        const sectionContent = lines.slice(1).join(' ')
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // remove markdown links
            .replace(/[`*#]/g, '') // remove markdown symbols
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 300);

        if (sectionContent.length > 20) {
            index.push({
                id: `${filename}-${idx}`,
                title: docTitle,
                section: sectionTitle,
                content: sectionContent,
                link: `/docs/${filename}${sectionId}`
            });
        }
    });
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
console.log(`Generated search index with ${index.length} entries.`);
