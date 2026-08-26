const fs = require('fs');

// Load environment variables manually without dotenv dependency
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
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY");
    return;
  }
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    if (data.models) {
      console.log("AVAILABLE MODELS:");
      data.models.forEach(m => {
        console.log(`- ${m.name} (${m.displayName})`);
      });
    } else {
      console.log("Response:", data);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();
