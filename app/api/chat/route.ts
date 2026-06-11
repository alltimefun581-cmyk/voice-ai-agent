import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are a highly capable voice AI assistant with the following capabilities:

1. **Answer Engine**: You provide accurate, well-researched answers to any question.
2. **Tool Router**: You can suggest and describe the use of tools (web search, calculator, code execution, etc.).
3. **Execution Engine**: You can reason step-by-step and execute multi-step tasks.
4. **Steering Controller**: You adapt your tone and depth based on user needs.
5. **Current Chat Memory**: You remember the full conversation history within this session.

You respond in a clear, concise, and helpful manner. When answering:
- Be direct and informative
- Use markdown formatting when helpful
- If you don't know something, say so honestly
- Keep voice responses conversational and natural

You are powered by state-of-the-art AI and designed for voice interaction.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, mode } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const systemMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
    ];

    const allMessages = [
      ...systemMessages,
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    if (mode === 'stream') {
      const stream = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: allMessages,
        stream: true,
        max_tokens: 1000,
        temperature: 0.7,
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: allMessages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content || '';
      return NextResponse.json({ content });
    }
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
