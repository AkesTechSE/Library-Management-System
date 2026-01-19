import fs from 'fs';
import readline from 'readline';
import PDFDocument from 'pdfkit';

// Usage: node txt-to-pdf.js input.txt output.pdf
const [,, inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error('Usage: node txt-to-pdf.js input.txt output.pdf');
  process.exit(1);
}

const doc = new PDFDocument({ margin: 50, size: 'A4' });
const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);
doc.font('Times-Roman').fontSize(12);

const rl = readline.createInterface({
  input: fs.createReadStream(inputPath),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  doc.text(line, {
    width: 500,
    align: 'left',
    lineGap: 4,
  });
});

rl.on('close', () => {
  doc.end();
});

writeStream.on('finish', () => {
  console.log(`PDF created: ${outputPath}`);
});
