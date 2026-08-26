const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables manually
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = val;
    }
  });
}

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const testModels = [
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-3.6-flash',
    'gemini-3.7-flash'
  ];
  
  for (const modelName of testModels) {
    console.log(`Checking model: ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      // Add a timeout using Promise.race
      const resultPromise = model.generateContent("Hello, reply with only the word: SUCCESS");
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 8000));
      
      const result = await Promise.race([resultPromise, timeoutPromise]);
      console.log(`Model ${modelName}: SUCCESS - response: ${result.response.text().trim()}`);
    } catch (err) {
      console.log(`Model ${modelName}: FAILED - ${err.message}`);
    }
  }
}

run();
