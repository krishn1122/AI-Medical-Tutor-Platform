
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
    console.log('HeyGen request:', { action, data });

    switch (action) {
      case 'create_session':
        // Create streaming avatar session
        const sessionResponse = await fetch(`${HEYGEN_BASE_URL}/streaming.create`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HEYGEN_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            avatar_id: data.avatarId,
            voice: {
              voice_id: data.voiceId,
              rate: 1.0,
              emotion: "Excited"
            },
            version: "v2",
            video_encoding: "H264",
            session_timeout: 600
          })
        });

        if (!sessionResponse.ok) {
          const errorText = await sessionResponse.text();
          console.error('HeyGen session error response:', errorText);
          return new Response(JSON.stringify({ 
            error: `HeyGen API error: ${sessionResponse.status} - ${errorText}` 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const sessionData = await sessionResponse.json();
        console.log('HeyGen session created:', sessionData);

        return new Response(JSON.stringify(sessionData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'speak':
        // Send text to avatar for speaking
        const speakResponse = await fetch(`${HEYGEN_BASE_URL}/streaming.task`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HEYGEN_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: data.sessionId,
            text: data.text,
            task_type: "talk",
            task_mode: "sync"
          })
        });

        if (!speakResponse.ok) {
          const errorText = await speakResponse.text();
          console.error('HeyGen speak error response:', errorText);
          return new Response(JSON.stringify({ 
            error: `HeyGen speak API error: ${speakResponse.status} - ${errorText}` 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const speakData = await speakResponse.json();
        console.log('HeyGen speak response:', speakData);

        return new Response(JSON.stringify(speakData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'close_session':
        // Close the streaming session
        const closeResponse = await fetch(`${HEYGEN_BASE_URL}/streaming.stop`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HEYGEN_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: data.sessionId
          })
        });

        const closeData = await closeResponse.json();
        console.log('HeyGen session closed:', closeData);

        return new Response(JSON.stringify(closeData), {
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
    return new Response(JSON.stringify({ 
      error: `Server error: ${error.message}`,
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
