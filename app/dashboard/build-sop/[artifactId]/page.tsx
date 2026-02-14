'use client';

import { useState, useEffect } from 'react';
import { artifacts, sops } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useParams, useRouter } from 'next/navigation';

interface Artifact {
  id: number;
  title: string;
  content: string;
}

interface Step {
  title: string;
  description?: string;
  source_artifact_id?: number;
}

export default function BuildSOPPage() {
  const params = useParams();
  const router = useRouter();
  const artifactId = Number(params.artifactId);

  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [loading, setLoading] = useState(true);
  const [sopTitle, setSopTitle] = useState('');
  const [sopDescription, setSopDescription] = useState('');
  const [steps, setSteps] = useState<Step[]>([
    { title: '', description: '' }
  ]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadArtifact();
  }, [artifactId]);

  const loadArtifact = async () => {
    const response = await artifacts.get(artifactId);
    if (!response.error && response.data) {
      const art = response.data as Artifact;
      setArtifact(art);
      setSopTitle(`SOP: ${art.title}`);
    }
    setLoading(false);
  };

  const handleAddStep = () => {
    setSteps([...steps, { title: '', description: '' }]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, field: string, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleCreate = async () => {
    if (!sopTitle || steps.some(s => !s.title)) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);
    const stepsData = steps.map((step) => ({
      title: step.title,
      description: step.description || '',
      source_artifact_id: artifactId,
    }));

    const response = await sops.create(sopTitle, sopDescription, undefined, stepsData);
    if (!response.error) {
      router.push(`/dashboard/sops/${response.data?.id}`);
    }
    setCreating(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!artifact) {
    return (
      <div className="p-8">
        <p className="text-slate-600">Artifact not found</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Create SOP from Artifact</h1>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Reference Artifact</h2>
          <div className="p-4 bg-slate-50 rounded">
            <p className="font-medium text-slate-900">{artifact.title}</p>
            <pre className="text-sm text-slate-700 mt-2 whitespace-pre-wrap max-h-[200px] overflow-auto">
              {artifact.content}
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">SOP Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                SOP Title *
              </label>
              <Input
                type="text"
                value={sopTitle}
                onChange={(e) => setSopTitle(e.target.value)}
                placeholder="SOP title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={sopDescription}
                onChange={(e) => setSopDescription(e.target.value)}
                placeholder="SOP description"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[100px]"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Steps</h2>
            <Button variant="outline" onClick={handleAddStep}>
              + Add Step
            </Button>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded border border-slate-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-slate-900">Step {index + 1}</h3>
                  {steps.length > 1 && (
                    <button
                      onClick={() => handleRemoveStep(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Title *
                    </label>
                    <Input
                      type="text"
                      value={step.title}
                      onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                      placeholder="Step title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={step.description || ''}
                      onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                      placeholder="Step description"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[80px] text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? 'Creating SOP...' : 'Create SOP'}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
