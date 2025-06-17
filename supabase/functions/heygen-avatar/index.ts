
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
const HEYGEN_BASE_URL = 'https://api.heygen.com/v1';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();

    switch (action) {
      case 'create_session':
        const sessionResponse = await fetch(`${HEYGEN_BASE_URL}/streaming/create_session`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HEYGEN_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            avatar_id: data.avatarId,
            voice_id: data.voiceId,
            quality: 'high'
          })
        });

        const sessionData = await sessionResponse.json();
        console.log('HeyGen session created:', sessionData);

        return new Response(JSON.stringify(sessionData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'speak':
        const speakResponse = await fetch(`${HEYGEN_BASE_URL}/streaming/speak`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HEYGEN_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: data.text,
            task_type: data.type || 'question'
          })
        });

        const speakData = await speakResponse.json();
        console.log('HeyGen speak response:', speakData);

        return new Response(JSON.stringify(speakData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('HeyGen API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
