async function testQuery(msg, expectedBehavior) {
  try {
    const response = await fetch("http://localhost:3000/api/ai/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });
    const data = await response.json();
    const resp = data.response || "";
    
    // Check pass/fail conditions
    const isGenericFallback = resp.includes("AI Voice Coordinator") || resp.includes("Try asking me queries like");
    const pass = data.success && !isGenericFallback;
    
    console.log(`\n${"=".repeat(60)}`);
    console.log(`TEST: "${msg}"`);
    console.log(`Expected: ${expectedBehavior}`);
    console.log(`Status: ${pass ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`Tool: ${data.toolCalled || "None"}`);
    console.log(`Response (first 200 chars): ${resp.substring(0, 200)}`);
    console.log(`${"=".repeat(60)}`);
    return pass;
  } catch (err) {
    console.log(`\n❌ FAIL: "${msg}" — Network error: ${err.message}`);
    return false;
  }
}

async function run() {
  console.log("\n🏥 JANCARE AI ASSISTANT — COMPREHENSIVE TEST SUITE\n");
  
  let passed = 0;
  let failed = 0;
  
  const tests = [
    ["Hello", "Natural greeting"],
    ["Mujhe Bukhar hai", "Hindi response, SYMPTOM_REPORT, fever detected"],
    ["मला ताप आला आहे", "Marathi response, SYMPTOM_REPORT, fever detected"],
    ["I have fever", "English response, SYMPTOM_REPORT"],
    ["Meri appointment kab hai?", "Hindi, CHECK_APPOINTMENT"],
    ["Meri medicine kaha milegi?", "Hindi, CHECK_MEDICINE_AVAILABILITY"],
    ["माझा रेफरल स्टेटस काय आहे?", "Marathi, CHECK_REFERRAL"],
    ["I need to talk to a doctor", "English, BOOK_APPOINTMENT"],
  ];
  
  for (const [msg, expected] of tests) {
    const ok = await testQuery(msg, expected);
    if (ok) passed++; else failed++;
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${tests.length}`);
  console.log(`${"=".repeat(60)}\n`);
}

run();
