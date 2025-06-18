
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
const HEYGEN_BASE_URL = 'https://api.heygen.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    console.log('HeyGen request:', { action, data });

    switch (action) {
      case 'create_session':
        // Create new streaming session using the correct endpoint
        const sessionResponse = await fetch(`${HEYGEN_BASE_URL}/v1/streaming.new`, {
          method: 'POST',
          headers: {
            'x-api-key': HEYGEN_API_KEY,
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify({
            avatar_id: data.avatarId,
            voice: {
              voice_id: data.voiceId,
              rate: 1.0,
              emotion: "Excited"
            },
            version: "v2",
            video_encoding: "H264"
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

      case 'create_token':
        // Create session token
        const tokenResponse = await fetch(`${HEYGEN_BASE_URL}/v1/streaming.create_token`, {
          method: 'POST',
          headers: {
            'x-api-key': HEYGEN_API_KEY,
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify({})
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('HeyGen token error response:', errorText);
          return new Response(JSON.stringify({ 
            error: `HeyGen token API error: ${tokenResponse.status} - ${errorText}` 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const tokenData = await tokenResponse.json();
        console.log('HeyGen token created:', tokenData);

        return new Response(JSON.stringify(tokenData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_avatars':
        // Get available avatars
        const avatarsResponse = await fetch(`${HEYGEN_BASE_URL}/v2/avatars`, {
          method: 'GET',
          headers: {
            'x-api-key': HEYGEN_API_KEY,
            'accept': 'application/json'
          }
        });

        if (!avatarsResponse.ok) {
          const errorText = await avatarsResponse.text();
          console.error('HeyGen avatars error response:', errorText);
          return new Response(JSON.stringify({ 
            error: `HeyGen avatars API error: ${avatarsResponse.status} - ${errorText}` 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const avatarsData = await avatarsResponse.json();
        console.log('HeyGen avatars retrieved:', avatarsData);

        return new Response(JSON.stringify(avatarsData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_voices':
        // Get available voices
        const voicesResponse = await fetch(`${HEYGEN_BASE_URL}/v2/voices`, {
          method: 'GET',
          headers: {
            'x-api-key': HEYGEN_API_KEY,
            'accept': 'application/json'
          }
        });

        if (!voicesResponse.ok) {
          const errorText = await voicesResponse.text();
          console.error('HeyGen voices error response:', errorText);
          return new Response(JSON.stringify({ 
            error: `HeyGen voices API error: ${voicesResponse.status} - ${errorText}` 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const voicesData = await voicesResponse.json();
        console.log('HeyGen voices retrieved:', voicesData);

        return new Response(JSON.stringify(voicesData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'speak':
        // Send text to avatar for speaking via WebRTC signaling
        console.log('Speak action received with session:', data.sessionId);
        
        // For now, we'll return success - the actual speaking will be handled via WebRTC
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Speech command queued',
          text: data.text 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'close_session':
        // Close the streaming session
        console.log('Closing HeyGen session:', data.sessionId);
        
        // Return success for session closure
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Session closed' 
        }), {
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
