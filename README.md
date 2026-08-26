# जनCare | From First Symptom to Complete Care

जनCare (JanCare) is an AI-assisted, offline-first healthcare coordination platform designed for rural and underserved communities in Maharashtra.

## Core Journey
`First Symptom ➔ Patient/ASHA Registration ➔ AI-Assisted Triage ➔ PHC/Doctor Video Consultation ➔ Clinical Decisions ➔ Medicine Stock Checks ➔ Referrals ➔ Frontline Follow-ups ➔ Complete Care`

---

## 🚀 Setup & Execution Guide

Follow these steps to run the complete production-grade application on your local machine:

### Step 1: System Requirements
1. Install **Node.js LTS** (version 20+ recommended).
2. Install **Git**.
3. Install **VS Code** (or your preferred editor).

### Step 2: Database Setup (MongoDB Atlas)
1. Sign up for a free account at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a free shared cluster (**M0 Free**).
3. Under **Database Access**, create a user with a password.
4. Under **Network Access**, click "Add IP Address" and select **Allow Access From Anywhere** (`0.0.0.0/0`) for local testing.
5. In your cluster dashboard, click **Connect** ➔ **Drivers** to copy your connection string.

### Step 3: API Key Registrations (Optional for Sandbox Mode)
JanCare runs in fully interactive **Sandbox/Fallback Mode** out of the box if these keys are missing:
* **Google Gemini API**: Register at [Google AI Studio](https://aistudio.google.com/) for free clinical triage reasoning.
* **Daily.co WebRTC Video**: Sign up for a free developer account at [daily.co](https://www.daily.co/) for live browser-based consultations.

### Step 4: Environment Configuration
1. In the project root, copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
2. Open `.env` and fill in your `MONGODB_URI` connection string, and optional API keys:
   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.xxxx.mongodb.net/jancare
   GEMINI_API_KEY=your_gemini_key
   DAILY_API_KEY=your_daily_key
   DAILY_DOMAIN=your_daily_domain.daily.co
   ```

### Step 5: Installation & Run
1. Install node dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

---

## 💡 Smart India Hackathon (SIH) Showcase Scenario

To demonstrate the full continuous care loop with synthetic data:
1. Navigate to the Login Page [http://localhost:3000/login](http://localhost:3000/login).
2. Select **ASHA Worker - Sharda Patil** in the **SIH Demonstration Accounts** panel. The system will automatically seed your database with Ramesh Kumar's scenario.
3. Toggle the **Simulate Offline Mode** switch to test local offline patient registrations and vitals.
4. Go back **Online & Sync** to trigger automatic background synchronization and witness AI Triage assessments.
5. Log out, and log in as **Doctor - Dr. Aniruddha Kulkarni** to launch the live dual-pane video consultation, write prescriptions, and coordinate follow-up alerts!
