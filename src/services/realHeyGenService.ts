
import { supabase } from '@/integrations/supabase/client';

export interface HeyGenConfig {
  avatarId: string;
  voiceId: string;
}

export interface AvatarMessage {
  text: string;
  type: 'question' | 'feedback' | 'encouragement' | 'explanation';
}

export class RealHeyGenService {
  private config: HeyGenConfig;
  private isConnected: boolean = false;

  constructor(config: HeyGenConfig) {
    this.config = config;
  }

  async initializeStream(): Promise<boolean> {
    try {
      console.log('Initializing HeyGen streaming avatar...');
      
      const { data, error } = await supabase.functions.invoke('heygen-avatar', {
        body: {
          action: 'create_session',
          data: {
            avatarId: this.config.avatarId,
            voiceId: this.config.voiceId
          }
        }
      });

      if (error) {
        console.error('HeyGen initialization error:', error);
        return false;
      }

      console.log('HeyGen session created:', data);
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('HeyGen initialization failed:', error);
      return false;
    }
  }

  async sendMessage(message: AvatarMessage): Promise<boolean> {
    if (!this.isConnected) {
      console.warn('Avatar not connected');
      return false;
    }

    try {
      console.log('Sending message to avatar:', message);
      
      const { data, error } = await supabase.functions.invoke('heygen-avatar', {
        body: {
          action: 'speak',
          data: {
            text: message.text,
            type: message.type
          }
        }
      });

      if (error) {
        console.error('Failed to send message to avatar:', error);
        return false;
      }

      console.log('Avatar message sent:', data);
      return true;
    } catch (error) {
      console.error('Failed to send message to avatar:', error);
      return false;
    }
  }

  async speakQuestion(question: string, options: string[]): Promise<boolean> {
    const fullText = `${question} Your options are: ${options.map((opt, idx) => 
      `Option ${String.fromCharCode(65 + idx)}: ${opt}`
    ).join('. ')}. Please select your answer.`;

    return this.sendMessage({
      text: fullText,
      type: 'question'
    });
  }

  async provideFeedback(isCorrect: boolean, encouragement: string): Promise<boolean> {
    const message = isCorrect 
      ? `Excellent! ${encouragement}` 
      : `Not quite right. ${encouragement}`;

    return this.sendMessage({
      text: message,
      type: 'feedback'
    });
  }

  async giveExplanation(explanation: string): Promise<boolean> {
    return this.sendMessage({
      text: `Let me explain: ${explanation}`,
      type: 'explanation'
    });
  }

  disconnect(): void {
    this.isConnected = false;
    console.log('HeyGen service disconnected');
  }

  isStreamConnected(): boolean {
    return this.isConnected;
  }
}
