/**
 * JanCare Clinical Triage Engine Verification Script
 * Validates clinical triage safety rules.
 */

const { runTriageAssessment } = require("../lib/providers/ai");

async function runTests() {
  console.log("--------------------------------------------------");
  console.log("Running JanCare Clinical safety triage rules checks...");
  console.log("--------------------------------------------------");

  const testCases = [
    {
      name: "Critical Hypoxia Alert",
      vitals: { temperature: 98.6, spo2: 90, heartRate: 75 },
      symptoms: [{ name: "Cough", durationDays: 4, severity: "Mild" }],
      expectedLevel: "Urgent",
    },
    {
      name: "Severe High Fever Alert",
      vitals: { temperature: 103.5, spo2: 98, heartRate: 90 },
      symptoms: [{ name: "Headache", durationDays: 2, severity: "Moderate" }],
      expectedLevel: "Urgent",
    },
    {
      name: "Moderate Fever and Weakness",
      vitals: { temperature: 101.2, spo2: 96, heartRate: 85 },
      symptoms: [
        { name: "Fever", durationDays: 3, severity: "Moderate" },
        { name: "Weakness", durationDays: 3, severity: "Moderate" },
      ],
      expectedLevel: "Priority",
    },
    {
      name: "Standard Mild Symptoms",
      vitals: { temperature: 98.4, spo2: 98, heartRate: 72 },
      symptoms: [{ name: "Mild Cough", durationDays: 2, severity: "Mild" }],
      expectedLevel: "Routine",
    },
  ];

  let passed = 0;
  for (const tc of testCases) {
    const result = await runTriageAssessment(tc.vitals, tc.symptoms, 54, "Male");
    const success = result.level === tc.expectedLevel;
    
    if (success) {
      console.log(`✓ [PASSED] ${tc.name} -> Got ${result.level} (Expected: ${tc.expectedLevel})`);
      passed++;
    } else {
      console.log(`❌ [FAILED] ${tc.name} -> Got ${result.level} (Expected: ${tc.expectedLevel})`);
      console.log(`   Reason given: ${result.reason}`);
    }
  }

  console.log("--------------------------------------------------");
  console.log(`Tests execution completed: ${passed}/${testCases.length} checks passed.`);
  console.log("--------------------------------------------------");
  
  if (passed === testCases.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Mock process.env inside test script context to prevent Gemini API crashes during local test execution
process.env.GEMINI_API_KEY = ""; 

runTests().catch((err) => {
  console.error("Test suite execution failed:", err);
  process.exit(1);
});
