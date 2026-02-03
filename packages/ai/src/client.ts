import OpenAI from 'openai';

// Singleton OpenAI client
let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    openaiClient = new OpenAI({
      apiKey,
    });
  }

  return openaiClient;
}

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

const DEFAULT_OPTIONS: Required<CompletionOptions> = {
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 1000,
  systemPrompt: 'You are Lucyn, an AI Product Engineer that helps software teams work more effectively.',
};

export async function createCompletion(
  prompt: string,
  options: CompletionOptions = {}
): Promise<string> {
  const client = getOpenAIClient();
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const response = await client.chat.completions.create({
    model: opts.model,
    temperature: opts.temperature,
    max_tokens: opts.maxTokens,
    messages: [
      { role: 'system', content: opts.systemPrompt },
      { role: 'user', content: prompt },
    ],
  });

  return response.choices[0]?.message?.content || '';
}

export async function createJSONCompletion<T>(
  prompt: string,
  options: CompletionOptions = {}
): Promise<T> {
  const client = getOpenAIClient();
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const response = await client.chat.completions.create({
    model: opts.model,
    temperature: opts.temperature,
    max_tokens: opts.maxTokens,
    response_format: { type: 'json_object' },
    messages: [
      { 
        role: 'system', 
        content: `${opts.systemPrompt}\n\nYou must respond with valid JSON only.` 
      },
      { role: 'user', content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content || '{}';
  return JSON.parse(content) as T;
}

export interface StreamOptions extends CompletionOptions {
  onToken?: (token: string) => void;
}

export async function createStreamingCompletion(
  prompt: string,
  options: StreamOptions = {}
): Promise<string> {
  const client = getOpenAIClient();
  const { onToken, ...restOptions } = options;
  const opts = { ...DEFAULT_OPTIONS, ...restOptions };

  const stream = await client.chat.completions.create({
    model: opts.model,
    temperature: opts.temperature,
    max_tokens: opts.maxTokens,
    stream: true,
    messages: [
      { role: 'system', content: opts.systemPrompt },
      { role: 'user', content: prompt },
    ],
  });

  let fullResponse = '';

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content || '';
    fullResponse += token;
    onToken?.(token);
  }

  return fullResponse;
}
