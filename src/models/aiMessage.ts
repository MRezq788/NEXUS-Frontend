export type AIMessageRole = 'system' | 'user' | 'assistant';

export interface AIMessage {
  role: AIMessageRole;
  content: string;
}

export type AIToolType =
  | 'proofread'
  | 'rewrite'
  | 'friendly'
  | 'professional'
  | 'concise'
  | 'compose';

export type AILanguage = 'english' | 'arabic';

export interface AIAssistRequest {
  type: AIToolType;
  text: string;
  language: AILanguage;
  composePrompt?: string;
}

export interface AIAutoTranslateRequest {
  text: string;
  targetLanguage: AILanguage;
}
