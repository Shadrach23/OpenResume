"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import { selectProfile, changeProfile } from "lib/redux/resumeSlice";

export const CVSummarizer = () => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectProfile);

  const [targetRole, setTargetRole] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setError(null);
    setLoading(true);
    setSummary(null);
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          url: profile.url,
          location: profile.location,
          summary: profile.summary,
          targetRole,
          company,
          jobDescription,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setSummary(data?.summary ?? "");
    } catch (e: any) {
      setError(e?.message || "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  const applyToProfile = () => {
    if (!summary) return;
    dispatch(changeProfile({ field: "summary", value: summary }));
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">Summarize my CV</h2>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700" htmlFor="target-role">Target Role</label>
        <input
          id="target-role"
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
          placeholder="e.g., Frontend Engineer"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700" htmlFor="company">Company (optional)</label>
        <input
          id="company"
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
          placeholder="e.g., Stripe"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700" htmlFor="jd">Job Description (paste text)</label>
        <textarea
          id="jd"
          rows={5}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
          placeholder="Paste the job description here for best results"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
        <p className="mt-1 text-xs text-gray-500">Tip: Paste JD text. If you only have a link, paste key requirements.</p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
          onClick={generate}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Summary"}
        </button>
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-60"
          onClick={applyToProfile}
          disabled={!summary}
        >
          Apply to Profile
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {summary && (
        <div className="mt-3 rounded-md border bg-white p-3">
          <div className="mb-1 text-sm font-semibold">Preview</div>
          <p className="whitespace-pre-line text-sm text-gray-800">{summary}</p>
        </div>
      )}
    </div>
  );
};
