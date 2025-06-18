
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
  private accessToken: string | null = null;
  private realtimeEndpoint: string | null = null;
  private websocket: WebSocket | null = null;

  constructor(config: HeyGenConfig) {
    this.config = config;
  }

  async initializeStream(): Promise<boolean> {
    try {
      console.log('Initializing HeyGen streaming avatar...');
      
      // First, get available voices to find a female voice if none specified
      if (!this.config.voiceId) {
        await this.getDefaultFemaleVoice();
      }

      // Create streaming session
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
      
      // Store session details from the new API response format
      if (data?.data) {
        this.sessionId = data.data.session_id;
        this.streamUrl = data.data.url;
        this.accessToken = data.data.access_token;
        this.realtimeEndpoint = data.data.realtime_endpoint;
        this.isConnected = true;
        
        console.log('Session details:', {
          sessionId: this.sessionId,
          streamUrl: this.streamUrl,
          realtimeEndpoint: this.realtimeEndpoint
        });

        // Initialize WebRTC connection for real-time communication
        if (this.realtimeEndpoint) {
          await this.initializeWebRTC();
        }

        return true;
      } else {
        console.error('Invalid response format from HeyGen API');
        return false;
      }
    } catch (error) {
      console.error('HeyGen initialization failed:', error);
      return false;
    }
  }

  private async getDefaultFemaleVoice(): Promise<void> {
    try {
      const { data } = await supabase.functions.invoke('heygen-avatar', {
        body: {
          action: 'get_voices'
        }
      });

      if (data?.data?.voices) {
        // Find a female voice
        const femaleVoice = data.data.voices.find((voice: any) => 
          voice.gender === 'Female' || voice.name.toLowerCase().includes('female')
        );
        
        if (femaleVoice) {
          this.config.voiceId = femaleVoice.voice_id;
          console.log('Selected female voice:', femaleVoice.name, femaleVoice.voice_id);
        } else {
          // Fallback to first available voice
          this.config.voiceId = data.data.voices[0]?.voice_id || 'default';
          console.log('Using fallback voice:', this.config.voiceId);
        }
      }
    } catch (error) {
      console.error('Error getting voices:', error);
      // Use your specified voice ID as fallback
      this.config.voiceId = 'EXAVITQu4vr4xnSDxMaL';
    }
  }

  private async initializeWebRTC(): Promise<void> {
    try {
      if (!this.realtimeEndpoint) return;

      // Connect to the realtime WebSocket endpoint
      this.websocket = new WebSocket(this.realtimeEndpoint);

      this.websocket.onopen = () => {
        console.log('WebRTC signaling connected');
      };

      this.websocket.onmessage = (event) => {
        console.log('WebRTC message received:', event.data);
      };

      this.websocket.onerror = (error) => {
        console.error('WebRTC error:', error);
      };

      this.websocket.onclose = () => {
        console.log('WebRTC connection closed');
      };
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
    }
  }

  async sendMessage(message: AvatarMessage): Promise<boolean> {
    if (!this.isConnected || !this.sessionId) {
      console.warn('Avatar not connected or no session ID');
      return false;
    }

    try {
      console.log('Sending message to avatar:', message);
      
      // Send message via WebSocket if available
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        const messageData = {
          type: 'speak',
          text: message.text,
          session_id: this.sessionId
        };
        
        this.websocket.send(JSON.stringify(messageData));
        console.log('Message sent via WebSocket');
        return true;
      } else {
        // Fallback to edge function
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

        console.log('Avatar message sent via edge function:', data);
        return true;
      }
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
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

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
    this.accessToken = null;
    this.realtimeEndpoint = null;
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

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRealtimeEndpoint(): string | null {
    return this.realtimeEndpoint;
  }
}
