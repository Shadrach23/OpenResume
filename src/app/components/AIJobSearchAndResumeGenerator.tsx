'use client';

import React, { useState } from 'react';
import { useAppDispatch } from 'lib/redux/hooks';
import { setResume } from 'lib/redux/resumeSlice';
export const AIJobSearchAndResumeGenerator: React.FC = () => {
  const [qualifications, setQualifications] = useState('');
  const [jobOpenings, setJobOpenings] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [tailoredResume, setTailoredResume] = useState<any>(null);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJobSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/job-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qualifications }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Job Search API Response:', data);
      setJobOpenings(data.jobOpenings);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateResume = async () => {
    if (!selectedJob) {
      setError('Please select a job opening first.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // In a real application, you would fetch user's resume data from Redux store or similar.
      // For now, we'll use mock data.
      const mockUserData = {
        name: 'John Doe',
        contact: 'john.doe@example.com',
        education: 'University of Example, BS in Computer Science',
        skills: ['React', 'Next.js', 'TypeScript', 'AI/ML'],
      };

      const response = await fetch('/api/resume-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userData: mockUserData, jobDescription: selectedJob }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Resume Generation API Response:', data);
      const newResume = {
        profile: {
          name: data.tailoredResume.name || '',
          email: data.tailoredResume.contact || '',
          phone: '', // Assuming phone is not in tailoredResume, set to empty or derive if possible
          url: '', // Assuming url is not in tailoredResume, set to empty or derive if possible
          summary: data.tailoredResume.summary || '', // Assuming summary might be part of tailoredResume
          location: '', // Assuming location is not in tailoredResume, set to empty or derive if possible
        },
        workExperiences: Array.isArray(data.tailoredResume.experience) ? data.tailoredResume.experience.map((exp: string) => ({ company: '', jobTitle: exp, date: '', descriptions: [] })) : [],
        educations: data.tailoredResume.education ? [{ school: Array.isArray(data.tailoredResume.education) ? data.tailoredResume.education.join(', ') : data.tailoredResume.education, degree: '', date: '', gpa: '', descriptions: [] }] : [],
        projects: [], // Assuming projects are not in tailoredResume, set to empty
        skills: {
          featuredSkills: data.tailoredResume.skills ? data.tailoredResume.skills.map((skill: string) => ({ skill, rating: 4 })) : [],
          descriptions: [],
        },
        custom: { descriptions: [] }, // Assuming custom is not in tailoredResume, set to empty
      };
      dispatch(setResume(newResume));
      setTailoredResume(newResume); // Keep for local display if needed
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">AI Job Search & Resume Generator</h2>

      <div className="mb-4">
        <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700">Your Qualifications (e.g., skills, experience):</label>
        <textarea
          id="qualifications"
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={qualifications}
          onChange={(e) => setQualifications(e.target.value)}
          placeholder="e.g., Experienced React developer with 5 years in web development, proficient in TypeScript and Node.js."
        />
        <button
          onClick={handleJobSearch}
          className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search for Jobs'}
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      {jobOpenings.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Found Job Openings:</h3>
          <ul className="mb-3 space-y-2">
            {jobOpenings.map((job) => (
              <li key={job.id} className="flex items-start justify-between gap-2">
                <div className="text-sm">
                  <div className="font-medium">{job.title} <span className="text-gray-500">at</span> {job.company}</div>
                  {job.location && <div className="text-gray-600">{job.location}</div>}
                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      View on job site
                    </a>
                  )}
                </div>
                <button
                  onClick={() => setSelectedJob(job)}
                  className="shrink-0 inline-flex items-center px-2 py-1 border border-gray-300 text-xs rounded-md bg-white hover:bg-gray-50"
                >
                  Select
                </button>
              </li>
            ))}
          </ul>

          <label htmlFor="jobSelect" className="block text-sm font-medium text-gray-700">Or select from list</label>
          <select
            id="jobSelect"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            onChange={(e) => setSelectedJob(jobOpenings.find(job => job.id === e.target.value))}
            value={selectedJob?.id ?? ''}
          >
            <option value="" disabled>Select a job</option>
            {jobOpenings.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} at {job.company}
              </option>
            ))}
          </select>

          {selectedJob?.url && (
            <a
              href={selectedJob.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50"
            >
              View selected job
            </a>
          )}
          <button
            onClick={handleGenerateResume}
            className="mt-2 ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            disabled={loading || !selectedJob}
          >
            {loading ? 'Generating...' : 'Generate Tailored Resume'}
          </button>
          <button
            onClick={() => window.open('/preview', '_blank')}
            className="mt-2 ml-2 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50"
            disabled={!tailoredResume}
          >
            Open Full Preview
          </button>
        </div>
      )}

      {tailoredResume && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Tailored Resume:</h3>
          <div className="bg-gray-100 p-4 rounded-md">
            <p><strong>Name:</strong> {tailoredResume.profile.name}</p>
            <p><strong>Contact:</strong> {tailoredResume.profile.email}</p>
            <p><strong>Summary:</strong> {tailoredResume.profile.summary}</p>
            <p><strong>Work Experience:</strong></p>
            <ul>
              {tailoredResume.workExperiences.map((exp: any, index: number) => (
                <li key={index}>- {exp.jobTitle} at {exp.company}</li>
              ))}
            </ul>
            <p><strong>Education:</strong></p>
            <ul>
              {tailoredResume.educations.map((edu: any, index: number) => (
                <li key={index}>- {edu.degree} from {edu.school}</li>
              ))}
            </ul>
            <p><strong>Skills:</strong> {tailoredResume.skills.featuredSkills.map((skill: any) => skill.skill).join(', ')}</p>
          </div>
        </div>
      )}
    </div>
  );
};