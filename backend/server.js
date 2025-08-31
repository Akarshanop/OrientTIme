import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

app.post('/ai/summary', async (req, res) => {
  try {
    const { weather } = req.body;

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'Missing OPENROUTER_API_KEY' });
    }

    const system = `You are a concise UX copywriter for a time & weather app.
Write a friendly 1–2 sentence weather summary under 30 words. 
No emojis. Clear, natural language for general users in India.`;

    const user = `Create the summary using:
City: ${weather.city}
Temperature: ${weather.temp}°C (feels like ${weather.feelsLike}°C)
Condition: ${weather.condition}
Chance of rain: ${weather.pop}%
Wind: ${weather.wind} km/h`;

    const r = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:5173',
        'X-Title': process.env.SITE_NAME || 'Orientime'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.7,
        max_tokens: 80
      }),
      timeout: 30000
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: 'OpenRouter error', details: text });
    }

    const data = await r.json();
    const text =
      data.choices?.[0]?.message?.content?.trim() ||
      'Weather looks stable with no significant changes expected.';

    res.json({ summary: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`AI proxy running on http://localhost:${PORT}`));
