import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  const { prompt, systemPrompt, geminiApiKey } = await req.json();

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent?key=${geminiApiKey}`;
  const body = {
    contents: [
      {
        parts: [{ text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt }]
      }
    ]
  };

  const geminiRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await geminiRes.json();
  return new Response(JSON.stringify({ text: data.candidates?.[0]?.content?.parts?.[0]?.text || '' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}); 