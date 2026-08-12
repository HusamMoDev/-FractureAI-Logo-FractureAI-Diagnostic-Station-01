# FractureAI Diagnostic Station

A web-based workstation designed for analyzing medical scans (like X-Rays, CT, and MRI) to help detect fractures and anomalies using AI.

## How to run it locally

First, make sure you have Node.js installed.

1. Install the project dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` or `.env.local` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

Open `http://localhost:3000` in your browser to see the app.

## Technologies used
- React & Vite
- TailwindCSS for styling
- Express (custom backend)
- Custom AI Model for Bone Fracture Detection (Currently in training phase / not yet complete)

## Notes
- The default login is bypassed in the UI for development, but you can configure actual authentication later.
- Make sure your API key has access to `gemini-3.6-flash` (or update `server.ts` to use a different model).
