import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const baseURL = process.env.OPENAI_BASE_URL; // e.g., https://openrouter.ai/api/v1
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL });

const pickModel = (preferred: '4o-mini' | '3.5') => {
  const isOpenRouter = (baseURL || '').includes('openrouter');
  if (preferred === '4o-mini') return isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini';
  return isOpenRouter ? 'openai/gpt-3.5-turbo' : 'gpt-3.5-turbo';
};

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { message: 'OPENAI_API_KEY is not set. Please add it to .env.local and restart the dev server.' },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({} as any));
    const { name, email, phone, url, location, summary, targetRole, company, jobDescription } = body as {
      name?: string;
      email?: string;
      phone?: string;
      url?: string;
      location?: string;
      summary?: string;
      targetRole?: string;
      company?: string;
      jobDescription?: string;
    };

    const prompt = `You are a helpful assistant that writes a concise, impactful resume objective/summary (2-3 sentences max). Use strong action verbs, include specialties, years of experience if implied, and avoid fluff. If an existing summary is provided, improve it. Keep it first-person implied (no "I"). Don't use emojis. Tailor the output to the target role and company when provided, and align with the pasted job description when available.

Candidate context (optional):
- Name: ${name ?? ''}
- Email: ${email ?? ''}
- Phone: ${phone ?? ''}
- URL: ${url ?? ''}
- Location: ${location ?? ''}
- Existing summary: ${summary ?? ''}
\nTarget role: ${targetRole ?? ''}
Company: ${company ?? ''}
Job description: ${jobDescription?.slice(0, 2400) ?? ''}

Return only the improved summary text, nothing else.`;

    const tryModel = async (model: string) => {
      return openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 160,
      });
    };

    let completion;
    try {
      completion = await tryModel(pickModel('4o-mini'));
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      const apiMsg = err?.error?.message || err?.response?.data?.error?.message;
      const apiCode = err?.error?.code || err?.response?.data?.error?.code;
      const apiType = err?.error?.type || err?.response?.data?.error?.type;
      const message = apiMsg || err?.message || 'OpenAI request failed';
      // Fallback to a broadly available model if model issue/auth
      if (status === 400 || status === 401 || status === 403 || status === 404) {
        try {
          completion = await tryModel(pickModel('3.5'));
        } catch (err2: any) {
          const status2 = err2?.status || err2?.response?.status || 502;
          const apiMsg2 = err2?.error?.message || err2?.response?.data?.error?.message;
          const apiCode2 = err2?.error?.code || err2?.response?.data?.error?.code;
          const apiType2 = err2?.error?.type || err2?.response?.data?.error?.type;
          const msg2 = apiMsg2 || err2?.message || message;
          return NextResponse.json({ message: msg2, code: apiCode2, type: apiType2 }, { status: status2 });
        }
      } else {
        return NextResponse.json({ message, code: apiCode, type: apiType }, { status: status || 502 });
      }
    }

    const content = completion.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json({ message: 'Empty AI response' }, { status: 502 });
    }

    // Sanitize line breaks length
    const cleaned = content.replace(/\n{3,}/g, '\n\n');

    return NextResponse.json({ summary: cleaned });
  } catch (error: any) {
    const status = error?.status || error?.response?.status || 500;
    const apiMsg = error?.error?.message || error?.response?.data?.error?.message;
    const apiCode = error?.error?.code || error?.response?.data?.error?.code;
    const apiType = error?.error?.type || error?.response?.data?.error?.type;
    const message = apiMsg || error?.message || 'Internal server error';
    console.error('AI summary error:', message);
    return NextResponse.json({ message, code: apiCode, type: apiType }, { status });
  }
}
