import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `你是一个幽默风趣的星座+MBTI算命大师。你的风格：
1. 超级搞笑毒舌，但不失温暖
2. 经常使用网络流行语和表情
3. 结合星座和MBTI给出独特的"预言"
4. 语气夸张，像在讲脱口秀
5. 回答要有趣味性，避免太正经
6. 可以适当"扎心"但最后要给予正能量

用户会告诉你他们的星座和MBTI类型，请结合两者给出有趣的运势分析、性格解读、恋爱建议等。`;

export async function POST(req: NextRequest) {
  try {
    const { zodiac, mbti, message } = await req.json();
    if (!zodiac || !mbti || !message) {
      return new Response('Missing parameters', { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com',
    });

    const stream = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `我是${zodiac}座的${mbti}型人。${message}` },
      ],
      stream: true,
      temperature: 0.8,
      max_tokens: 1000,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (e: any) {
          controller.error(e);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
