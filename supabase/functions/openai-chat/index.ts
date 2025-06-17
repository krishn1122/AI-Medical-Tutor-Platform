
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();

    switch (action) {
      case 'generate_explanation':
        const explanationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an expert medical educator. Provide clear, educational explanations for medical questions. Focus on helping the student understand the concept, not just the correct answer. Keep explanations concise but comprehensive.'
              },
              {
                role: 'user',
                content: `
                  Question: ${data.question}
                  Student's Answer: ${data.userAnswer}
                  Correct Answer: ${data.correctAnswer}
                  Medical Category: ${data.category}
                  
                  Please provide a clear explanation of why the correct answer is right and help the student understand the underlying medical concept. If the student's answer was incorrect, briefly explain why it was wrong.
                `
              }
            ],
            max_tokens: 200,
            temperature: 0.3
          })
        });

        const explanationData = await explanationResponse.json();
        console.log('OpenAI explanation response:', explanationData);

        return new Response(JSON.stringify({
          explanation: explanationData.choices[0]?.message?.content || 'Unable to generate explanation at this time.'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'generate_feedback':
        const feedbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an adaptive AI medical tutor. Analyze patterns in student errors and provide personalized learning suggestions. Be encouraging while identifying specific areas for improvement.'
              },
              {
                role: 'user',
                content: `
                  The student has answered the following questions incorrectly:
                  ${data.incorrectAnswers.map((item, index) => 
                    `${index + 1}. Category: ${item.category}\nQuestion: ${item.question}\nStudent's Answer: ${item.userAnswer}`
                  ).join('\n\n')}
                  
                  Please provide adaptive feedback that:
                  1. Identifies any patterns in the errors
                  2. Suggests specific areas to focus on
                  3. Provides encouragement
                  4. Recommends study strategies
                  
                  Keep the response motivational and actionable.
                `
              }
            ],
            max_tokens: 250,
            temperature: 0.5
          })
        });

        const feedbackData = await feedbackResponse.json();
        console.log('OpenAI feedback response:', feedbackData);

        return new Response(JSON.stringify({
          feedback: feedbackData.choices[0]?.message?.content || 'Keep practicing! Every mistake is a learning opportunity.'
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
    console.error('OpenAI API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
