import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface UserData {
  name?: string;
  contact?: string;
  education?: string[];
  skills?: string[];
  experience?: string[];
}

interface JobDescription {
  title: string;
  description?: string;
} 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userData, jobDescription } = body as { userData: UserData; jobDescription: JobDescription };

    if (!jobDescription?.title) {
      return NextResponse.json({ message: 'Job title is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { message: 'OPENAI_API_KEY is not set. Please add it to .env.local and restart the dev server.' },
        { status: 400 }
      );
    }

    const prompt = `
      Create a professional resume tailored for the following job:
      Job Title: ${jobDescription.title}
      Job Description: ${jobDescription.description ?? 'N/A'}

      Candidate Information:
      Name: ${userData.name ?? 'John Doe'}
      Contact: ${userData.contact ?? 'john.doe@example.com'}
      Education: ${Array.isArray(userData.education) ? userData.education.join(', ') : (userData.education as any) ?? 'Not specified'}
      Skills: ${userData.skills?.join(', ') ?? 'Not specified'}
      Experience: ${userData.experience?.join(', ') ?? 'Not specified'}

      Output ONLY valid JSON with keys: name, contact, education (array of strings), skills (array of strings), experience (array of strings). Do not include any prose before or after the JSON.
    `;

    // Non-streaming call for predictable JSON response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });

    const content = completion.choices?.[0]?.message?.content ?? '';

    // Attempt to parse JSON safely
    let tailoredResumeRaw: any = null;
    try {
      tailoredResumeRaw = JSON.parse(content);
    } catch {
      // Fallback: extract JSON substring
      const start = content.indexOf('{');
      const end = content.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        const jsonSubstring = content.slice(start, end + 1);
        try {
          tailoredResumeRaw = JSON.parse(jsonSubstring);
        } catch {}
      }
    }

    if (!tailoredResumeRaw) {
      return NextResponse.json({ message: 'Failed to parse AI response as JSON' }, { status: 502 });
    }

    // Normalize keys and types
    const tailoredResume = {
      name: String(tailoredResumeRaw.name ?? userData.name ?? ''),
      contact: String(tailoredResumeRaw.contact ?? userData.contact ?? ''),
      education: Array.isArray(tailoredResumeRaw.education) ? tailoredResumeRaw.education : (tailoredResumeRaw.education ? [String(tailoredResumeRaw.education)] : []),
      skills: Array.isArray(tailoredResumeRaw.skills) ? tailoredResumeRaw.skills : (tailoredResumeRaw.skills ? [String(tailoredResumeRaw.skills)] : []),
      experience: Array.isArray(tailoredResumeRaw.experience) ? tailoredResumeRaw.experience : (tailoredResumeRaw.experience ? [String(tailoredResumeRaw.experience)] : []),
    };

    return NextResponse.json({ tailoredResume });
  } catch (error) {
    console.error('AI resume error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
