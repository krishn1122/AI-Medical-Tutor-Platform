
// OpenAI Integration for generating explanations and adaptive feedback
export interface OpenAIResponse {
  explanation: string;
  adaptiveFeedback?: string;
}

export class OpenAIService {
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateExplanation(
    question: string, 
    userAnswer: string, 
    correctAnswer: string,
    category: string
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an expert medical educator. Provide clear, educational explanations for medical questions. Focus on helping the student understand the concept, not just the correct answer. Keep explanations concise but comprehensive.`
            },
            {
              role: 'user',
              content: `
                Question: ${question}
                Student's Answer: ${userAnswer}
                Correct Answer: ${correctAnswer}
                Medical Category: ${category}
                
                Please provide a clear explanation of why the correct answer is right and help the student understand the underlying medical concept. If the student's answer was incorrect, briefly explain why it was wrong.
              `
            }
          ],
          max_tokens: 200,
          temperature: 0.3
        })
      });

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Unable to generate explanation at this time.';
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
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an adaptive AI medical tutor. Analyze patterns in student errors and provide personalized learning suggestions. Be encouraging while identifying specific areas for improvement.`
            },
            {
              role: 'user',
              content: `
                The student has answered the following questions incorrectly:
                ${incorrectAnswers.map((item, index) => 
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

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Keep practicing! Every mistake is a learning opportunity.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      return 'Continue your excellent progress! Focus on reviewing the concepts you found challenging.';
    }
  }
}

// Mock service for development (when API key is not available)
export class MockOpenAIService {
  async generateExplanation(
    question: string, 
    userAnswer: string, 
    correctAnswer: string,
    category: string
  ): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return `This is a mock explanation for the ${category} question. The correct answer helps us understand the underlying medical principle. In clinical practice, this knowledge is essential for proper patient care and diagnosis.`;
  }

  async generateAdaptiveFeedback(
    incorrectAnswers: Array<{
      question: string;
      category: string;
      userAnswer: string;
    }>
  ): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const categories = [...new Set(incorrectAnswers.map(item => item.category))];
    return `I notice you're working through questions in ${categories.join(', ')}. This is great progress! Consider reviewing the fundamental concepts in these areas and practicing similar questions to strengthen your understanding.`;
  }
}
