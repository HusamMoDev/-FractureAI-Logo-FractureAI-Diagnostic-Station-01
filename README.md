# FractureAI Diagnostic Station

A web-based workstation designed for analyzing medical scans (like X-Rays, CT, and MRI) to help detect fractures and anomalies using AI.

## How to run it locally

First, make sure you have Node.js installed.

1. Install the project dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` or `.env.local` file in the root directory and add your Gemini API key *(Note: This is a temporary requirement while the custom model is in training)*:
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
- **Temporary AI Model:** We are currently using the Gemini API (`gemini-3.6-flash`) as a placeholder while our custom bone fracture detection model finishes training. Ensure your API key has access to this version, or update `server.ts` to use an alternative model.

## 📚 Academic & Intellectual Property

This project represents the practical implementation for an upcoming scientific paper (In Preparation) on automated bone fracture detection using object detection models and Explainable AI (XAI).

**Concept & Methodology Rights:** All rights regarding the system architecture, the integration of YOLOv12 with Grad-CAM, and the scientific methodology are fully reserved by the development team. Reproducing the system or adapting the research idea for academic publication without citing this repository (and the upcoming paper) is strictly prohibited.

**Frontend Source Code:** The frontend source code is open-sourced and available for learning purposes under the MIT License.
