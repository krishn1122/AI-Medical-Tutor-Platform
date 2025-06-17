
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
  private sessionId: string | null = null;
  private streamUrl: string | null = null;

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

      if (data?.error) {
        console.error('HeyGen API error:', data.error);
        return false;
      }

      console.log('HeyGen session created:', data);
      
      // Store session details
      this.sessionId = data?.session_id || data?.data?.session_id;
      this.streamUrl = data?.url || data?.data?.url;
      this.isConnected = true;
      
      if (!this.sessionId) {
        console.error('No session ID received from HeyGen');
        return false;
      }

      return true;
    } catch (error) {
      console.error('HeyGen initialization failed:', error);
      return false;
    }
  }

  async sendMessage(message: AvatarMessage): Promise<boolean> {
    if (!this.isConnected || !this.sessionId) {
      console.warn('Avatar not connected or no session ID');
      return false;
    }

    try {
      console.log('Sending message to avatar:', message);
      
      const { data, error } = await supabase.functions.invoke('heygen-avatar', {
        body: {
          action: 'speak',
          data: {
            sessionId: this.sessionId,
            text: message.text,
            type: message.type
          }
        }
      });

      if (error) {
        console.error('Failed to send message to avatar:', error);
        return false;
      }

      if (data?.error) {
        console.error('HeyGen speak API error:', data.error);
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

  async disconnect(): Promise<void> {
    if (this.sessionId) {
      try {
        await supabase.functions.invoke('heygen-avatar', {
          body: {
            action: 'close_session',
            data: {
              sessionId: this.sessionId
            }
          }
        });
      } catch (error) {
        console.error('Error closing HeyGen session:', error);
      }
    }
    
    this.isConnected = false;
    this.sessionId = null;
    this.streamUrl = null;
    console.log('HeyGen service disconnected');
  }

  isStreamConnected(): boolean {
    return this.isConnected;
  }

  getStreamUrl(): string | null {
    return this.streamUrl;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }
}
