const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../../.env");
const envContent = fs.readFileSync(envPath, "utf8");
let key = "";
envContent.split("\n").forEach((line) => {
  if (line.startsWith("GEMINI_API_KEY=")) {
    key = line.split("=")[1].trim();
  }
});

async function testModel(modelName) {
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: modelName });
    const response = await model.generateContent("hello");
    console.log(`Model ${modelName}: SUCCESS!`);
    console.log("Response:", response.response.text().trim());
    return true;
  } catch (err) {
    console.log(`Model ${modelName}: FAILED - ${err.message}`);
    return false;
  }
}

async function test() {
  await testModel("gemini-3.6-flash");
}

test();
