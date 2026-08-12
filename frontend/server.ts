import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Lazy init Gemini client with User-Agent header as specified in skill instructions
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Real-time AI Scan Diagnostic Endpoint
app.post('/api/analyze-scan', async (req, res) => {
  try {
    const { imageBase64, mimeType, patientInfo, modality, region } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required' });
    }

    const ai = getGeminiClient();

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const promptText = `
You are a senior board-certified chief radiologist and expert AI diagnostic model operating inside FractureAI Pro Workstation.
Analyze this medical diagnostic image (${modality || 'X-Ray'} of ${region || 'Bone region'}) for patient ${patientInfo?.name || 'Unknown'}.

Provide a detailed diagnostic report in JSON format matching this exact schema:
{
  "primaryFinding": "Specific fracture type or abnormality (e.g. Transverse Fracture, Colles' Fracture, Comminuted Tibia, or No Fracture Detected)",
  "confidence": 98.4,
  "affectedRegion": "${region || 'Bone region'}",
  "secondaryFinding": "Associated soft tissue swelling, dislocation, or joint displacement",
  "secondaryConfidence": 84.5,
  "indication": "Clinical indication summary",
  "technique": "Radiographic view description",
  "findingsList": [
    "Detailed anatomical finding 1",
    "Detailed anatomical finding 2",
    "Detailed anatomical finding 3"
  ],
  "impression": "Numbering list summary of radiologic impressions",
  "recommendation": "Clinical next steps, orthopedic consultation, splinting, CT follow-up, or immobilization guidance",
  "obbLabel": "Label for bounding box e.g. Fracture (98.4%)",
  "obbBox": {
    "top": "35%",
    "left": "40%",
    "width": "20%",
    "height": "25%",
    "rotation": "-5deg"
  }
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryFinding: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            affectedRegion: { type: Type.STRING },
            secondaryFinding: { type: Type.STRING },
            secondaryConfidence: { type: Type.NUMBER },
            indication: { type: Type.STRING },
            technique: { type: Type.STRING },
            findingsList: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            impression: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            obbLabel: { type: Type.STRING },
            obbBox: {
              type: Type.OBJECT,
              properties: {
                top: { type: Type.STRING },
                left: { type: Type.STRING },
                width: { type: Type.STRING },
                height: { type: Type.STRING },
                rotation: { type: Type.STRING },
              },
            },
          },
        },
      },
    });

    const resultText = response.text || '{}';
    const jsonResult = JSON.parse(resultText);

    return res.json({ success: true, data: jsonResult });
  } catch (err: any) {
    console.error('Error analyzing scan with Gemini:', err);
    return res.status(500).json({
      error: 'Failed to analyze scan via Gemini API',
      details: err.message,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FractureAI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
