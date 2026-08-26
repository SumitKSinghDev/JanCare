const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes("node_modules") && !file.includes(".next") && !file.includes(".git")) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".js") || file.endsWith(".jsx")) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, ".."));
const query = "gemini-1.5-flash";

files.forEach((file) => {
  try {
    const content = fs.readFileSync(file, "utf8");
    if (content.includes(query)) {
      console.log(`Found in: ${file}`);
    }
  } catch (e) {
  }
});
