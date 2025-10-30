import type { NextRequest } from 'next/server';

import { generateText } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const {
    apiKey: key,
    model = 'gpt-4o-mini',
    prompt,
    system,
  } = await req.json();

  const apiKey = key || process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing ai gateway API key.' },
      { status: 401 }
    );
  }

  try {
    const gatewayProvider = createGateway({ apiKey });

    const result = await generateText({
      abortSignal: req.signal,
      maxOutputTokens: 50,
      // Route through the AI Gateway provider instead of direct OpenAI env keys
      model: gatewayProvider(`openai/${model}`),
      prompt: prompt,
      system,
      temperature: 0.7,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(null, { status: 408 });
    }

    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
