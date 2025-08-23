"use client";

import { Provider } from "react-redux";
import { store } from "lib/redux/store";
import { Resume } from "components/Resume";
import { useSearchParams } from "next/navigation";

export default function PreviewPage() {
  const params = useSearchParams();
  const previewSummary = params.get("summary");

  return (
    <Provider store={store}>
      <main className="min-h-screen w-full bg-gray-50 p-4">
        <div className="mx-auto max-w-6xl space-y-4">
          {previewSummary ? (
            <div className="rounded-md border bg-white p-4">
              <div className="mb-2 text-sm font-semibold">AI Summary Preview (not yet applied)</div>
              <p className="whitespace-pre-line text-sm text-gray-800">{previewSummary}</p>
            </div>
          ) : null}
          <div className="rounded-md border bg-white p-2">
            <Resume />
          </div>
        </div>
      </main>
    </Provider>
  );
}
