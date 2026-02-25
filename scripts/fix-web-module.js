/**
 * Post-build fix: Expo Metro web generates bundles using `import.meta`
 * (ES module syntax) but the HTML <script> tag lacks `type="module"`,
 * causing a SyntaxError in the browser. This script patches the HTML.
 */
const fs = require("fs");
const path = require("path");

const distDir = path.resolve(__dirname, "..", "dist");

const htmlFiles = fs
  .readdirSync(distDir)
  .filter((f) => f.endsWith(".html"));

let patched = 0;

for (const file of htmlFiles) {
  const filePath = path.join(distDir, file);
  let html = fs.readFileSync(filePath, "utf-8");

  // Replace <script src="..." defer> with <script type="module" src="..." defer>
  const updated = html.replace(
    /<script\s+src="(\/_expo\/static\/js\/[^"]+)"\s+defer><\/script>/g,
    '<script type="module" src="$1" defer></script>'
  );

  if (updated !== html) {
    fs.writeFileSync(filePath, updated, "utf-8");
    patched++;
    console.log(`  Patched: ${file}`);
  }
}

console.log(`fix-web-module: ${patched} file(s) patched.`);
