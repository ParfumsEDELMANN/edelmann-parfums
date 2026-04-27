/**
 * EDELMANN Parfums — Cloudflare Worker: Claude AI Proxy
 *
 * Deploy steps:
 * 1. Go to dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Paste this code
 * 3. Settings → Variables → Add: ANTHROPIC_API_KEY = your key from console.anthropic.com
 * 4. Deploy → copy the Worker URL (e.g. https://edelmann-ai.YOUR-NAME.workers.dev)
 * 5. In index.html, set CLAUDE_WORKER_URL to that URL
 */

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const { prompt } = await request.json();

      if (!prompt || typeof prompt !== 'string' || prompt.length > 4000) {
        return new Response(JSON.stringify({ error: 'Invalid request' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 900,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!resp.ok) throw new Error('Anthropic API ' + resp.status);
      const data = await resp.json();
      const content = data.content[0].text;

      return new Response(JSON.stringify({ content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
