import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
    try {
      const { qualifications, location, query } = await req.json();

      // Build the base query from user input
      let effectiveQuery = (query || qualifications || '').toString();

      // Optionally enrich the query using OpenAI for better matching
      try {
        if (!effectiveQuery) {
          throw new Error('empty query');
        }
        if (process.env.OPENAI_API_KEY) {
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          const prompt = `You are assisting a job search. Rewrite the following user-provided qualifications or free text into a concise job search query suitable for a job board API. \nText: "${effectiveQuery}"\nRules:\n- Keep it under 12 words\n- Include most relevant job title(s), key skills, seniority, and optionally location if provided\n- No extra words, output only the query string, no quotes.`;
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
          });
          const aiQuery = completion.choices?.[0]?.message?.content?.trim();
          if (aiQuery) {
            effectiveQuery = aiQuery.replace(/^"|"$/g, ''); // strip quotes if present
          }
        }
      } catch (e) {
        // Silently fall back to the original query if AI enrichment fails
      }

      // 1) Primary provider: Remotive (no API key required)
      const remotiveUrl = `https://remotive.com/api/remote-jobs?${new URLSearchParams({
        search: effectiveQuery,
        limit: '50',
      }).toString()}`;

      try {
        const userAgent = process.env.CONTACT_EMAIL
          ? `OpenResume/1.0 (${process.env.CONTACT_EMAIL})`
          : 'OpenResume/1.0';
        const remotiveRes = await fetch(remotiveUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': userAgent,
          },
        });
        const remotiveData = await remotiveRes.json();
        if (remotiveRes.ok && Array.isArray(remotiveData?.jobs)) {
          const mapped = remotiveData.jobs.map((job: any) => {
            const title = job.title;
            const company = job.company_name;
            const rawUrl = job.url;
            const fallbackUrl = `https://www.google.com/search?${new URLSearchParams({ q: `${title} ${company}` }).toString()}`;
            return {
              id: job.id?.toString() || Math.random().toString(36).slice(2),
              title,
              company,
              description: job.description,
              location: job.candidate_required_location || 'Remote',
              url: rawUrl || fallbackUrl,
            };
          });
          if (mapped.length > 0) {
            return NextResponse.json({ jobOpenings: mapped, source: 'remotive' });
          }
        }
      } catch (e) {
        // Ignore and try fallback
      }

      // 2) Fallback provider: JSearch via RapidAPI (if key available)
      const X_RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
      const RAPIDAPI_HOST = 'jsearch.p.rapidapi.com';
      if (X_RAPIDAPI_KEY) {
        const params: Record<string, string> = {
          query: effectiveQuery,
          num_pages: '1',
        };
        if (location) params.location = location;

        const jsearchUrl = `https://${RAPIDAPI_HOST}/search?${new URLSearchParams(params).toString()}`;
        const options = {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': X_RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST,
          },
        } as const;

        const response = await fetch(jsearchUrl, options);
        const data = await response.json();
        if (response.ok) {
          const mapped = Array.isArray(data?.data)
            ? data.data.map((item: any) => {
                const title = item.job_title;
                const company = item.employer_name;
                const applyUrl = item.job_apply_link;
                const hasDirect = item.job_apply_is_direct;
                const fallbackUrl = `https://www.google.com/search?${new URLSearchParams({ q: `${title} ${company}` }).toString()}`;
                return {
                  id: item.job_id ?? item.job_post_id ?? item.job_title ?? Math.random().toString(36).slice(2),
                  title,
                  company,
                  description: item.job_description,
                  location: [item.job_city, item.job_state, item.job_country].filter(Boolean).join(', '),
                  url: (hasDirect && applyUrl) ? applyUrl : (applyUrl || fallbackUrl),
                };
              })
            : [];
          return NextResponse.json({ jobOpenings: mapped, source: 'jsearch' }, { status: response.status });
        } else {
          console.error('JSearch API error:', data);
          return NextResponse.json({ message: 'Error fetching job openings from JSearch API' }, { status: response.status });
        }
      }

      // 3) If no providers returned results
      return NextResponse.json({ jobOpenings: [], message: 'No results available from providers.' }, { status: 200 });
    } catch (error) {
      console.error('Job search error:', error);
      return NextResponse.json({ message: 'Error performing job search' }, { status: 500 });
    }
}