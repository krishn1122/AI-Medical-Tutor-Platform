
import { supabase } from '@/integrations/supabase/client';

export class RealOpenAIService {
  async generateExplanation(
    question: string, 
    userAnswer: string, 
    correctAnswer: string,
    category: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          action: 'generate_explanation',
          data: {
            question,
            userAnswer,
            correctAnswer,
            category
          }
        }
      });

      if (error) {
        console.error('OpenAI explanation error:', error);
        return 'Unable to generate explanation due to technical issues.';
      }

      return data?.explanation || 'Unable to generate explanation at this time.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      return 'Unable to generate explanation due to technical issues.';
    }
  }

  async generateAdaptiveFeedback(
    incorrectAnswers: Array<{
      question: string;
      category: string;
      userAnswer: string;
    }>
  ): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          action: 'generate_feedback',
          data: {
            incorrectAnswers
          }
        }
      });

      if (error) {
        console.error('OpenAI feedback error:', error);
        return 'Continue your excellent progress! Focus on reviewing the concepts you found challenging.';
      }

      return data?.feedback || 'Keep practicing! Every mistake is a learning opportunity.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      return 'Continue your excellent progress! Focus on reviewing the concepts you found challenging.';
    }
  }
}
