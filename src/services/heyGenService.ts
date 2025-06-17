
// HeyGen Streaming Avatar Integration
export interface HeyGenConfig {
  apiKey: string;
  avatarId: string;
  voiceId: string;
  webhookUrl?: string;
}

export interface AvatarMessage {
  text: string;
  type: 'question' | 'feedback' | 'encouragement' | 'explanation';
}

export class HeyGenService {
  private config: HeyGenConfig;
  private websocket: WebSocket | null = null;
  private isConnected: boolean = false;

  constructor(config: HeyGenConfig) {
    this.config = config;
  }

  async initializeStream(): Promise<boolean> {
    try {
      // HeyGen streaming avatar initialization
      console.log('Initializing HeyGen streaming avatar...');
      
      // TODO: Implement actual HeyGen API connection
      // const response = await fetch('https://api.heygen.com/v1/streaming/create_session', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.config.apiKey}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     avatar_id: this.config.avatarId,
      //     voice_id: this.config.voiceId,
      //     quality: 'high',
      //     webhook_url: this.config.webhookUrl
      //   })
      // });

      // Mock successful connection for development
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
      
      // TODO: Implement actual HeyGen message sending
      // const response = await fetch('https://api.heygen.com/v1/streaming/speak', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.config.apiKey}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     text: message.text,
      //     task_type: message.type
      //   })
      // });

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
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.isConnected = false;
  }

  isStreamConnected(): boolean {
    return this.isConnected;
  }
}

// Mock service for development
export class MockHeyGenService {
  private isConnected: boolean = false;

  async initializeStream(): Promise<boolean> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.isConnected = true;
    console.log('Mock HeyGen service connected');
    return true;
  }

  async sendMessage(message: AvatarMessage): Promise<boolean> {
    console.log('Mock avatar speaking:', message.text);
    return true;
  }

  async speakQuestion(question: string, options: string[]): Promise<boolean> {
    console.log('Mock avatar asking question:', question);
    return true;
  }

  async provideFeedback(isCorrect: boolean, encouragement: string): Promise<boolean> {
    console.log('Mock avatar feedback:', { isCorrect, encouragement });
    return true;
  }

  async giveExplanation(explanation: string): Promise<boolean> {
    console.log('Mock avatar explanation:', explanation);
    return true;
  }

  disconnect(): void {
    this.isConnected = false;
    console.log('Mock HeyGen service disconnected');
  }

  isStreamConnected(): boolean {
    return this.isConnected;
  }
}
