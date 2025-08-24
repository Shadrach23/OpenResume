import { BaseForm } from "components/ResumeForm/Form";
import { Input, Textarea } from "components/ResumeForm/Form/InputGroup";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import { changeProfile, selectProfile } from "lib/redux/resumeSlice";
import { ResumeProfile } from "lib/redux/types";
import { useState } from "react";

export const ProfileForm = () => {
  const profile = useAppSelector(selectProfile);
  const dispatch = useAppDispatch();
  const { name, email, phone, url, summary, location } = profile;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);

  const handleProfileChange = (field: keyof ResumeProfile, value: string) => {
    dispatch(changeProfile({ field, value }));
  };

  return (
    <BaseForm>
      <div className="grid grid-cols-6 gap-3">
        <Input
          label="Name"
          labelClassName="col-span-full"
          name="name"
          placeholder="Sal Khan"
          value={name}
          onChange={handleProfileChange}
        />
        <div className="col-span-full">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Objective</label>
            <button
              type="button"
              className="rounded-md border border-gray-300 px-2 py-0.5 text-xs hover:bg-gray-100 disabled:opacity-60"
              onClick={async () => {
                setError(null);
                setLoading(true);
                setGeneratedSummary(null);
                try {
                  const res = await fetch("/api/ai/summary", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name,
                      email,
                      phone,
                      url,
                      location,
                      summary,
                    }),
                  });
                  if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data?.message || `Request failed (${res.status})`);
                  }
                  const data = await res.json();
                  if (data?.summary) {
                    setGeneratedSummary(data.summary);
                  }
                } catch (e: any) {
                  setError(e?.message || "Failed to generate summary");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Summary (AI)"}
            </button>
          </div>
          <Textarea
            label="Summary"
            labelClassName="hidden"
            name="summary"
            placeholder="Entrepreneur and educator obsessed with making education free for anyone"
            value={summary}
            onChange={handleProfileChange}
          />
          {generatedSummary ? (
            <div className="mt-2 rounded-md border bg-white p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold">AI Summary Preview</span>
                <button
                  type="button"
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs hover:bg-gray-50"
                  onClick={() => {
                    if (!generatedSummary) return;
                    dispatch(changeProfile({ field: "summary", value: generatedSummary }));
                    setGeneratedSummary(null);
                  }}
                >
                  Apply to Objective
                </button>
              </div>
              <p className="whitespace-pre-line text-sm text-gray-800">{generatedSummary}</p>
            </div>
          ) : null}
          {error ? (
            <p className="mt-1 text-xs text-red-600">{error}</p>
          ) : null}
        </div>
        <Input
          label="Email"
          labelClassName="col-span-4"
          name="email"
          placeholder="hello@khanacademy.org"
          value={email}
          onChange={handleProfileChange}
        />
        <Input
          label="Phone"
          labelClassName="col-span-2"
          name="phone"
          placeholder="(123)456-7890"
          value={phone}
          onChange={handleProfileChange}
        />
        <Input
          label="Website"
          labelClassName="col-span-4"
          name="url"
          placeholder="linkedin.com/in/khanacademy"
          value={url}
          onChange={handleProfileChange}
        />
        <Input
          label="Location"
          labelClassName="col-span-2"
          name="location"
          placeholder="NYC, NY"
          value={location}
          onChange={handleProfileChange}
        />
      </div>
    </BaseForm>
  );
};
