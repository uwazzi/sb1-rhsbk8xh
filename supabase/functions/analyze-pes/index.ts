import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

function calculateScores(responses: Record<string, string>) {
  // Use your logic from src/lib/pes.ts here!
  // For brevity, this is a stub:
  return {
    negativeCognitive: 70,
    positiveCognitive: 80,
    negativeAffective: 65,
    positiveAffective: 75,
    overall: 72.5,
    summary: "Stub: Replace with real analysis."
  };
}

serve(async (req) => {
  const { responses } = await req.json();
  const scores = calculateScores(responses);
  return new Response(JSON.stringify(scores), {
    headers: { 'Content-Type': 'application/json' }
  });
}); 