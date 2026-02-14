'use client';

import { useState, useEffect } from 'react';
import { sops } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface SOPStep {
  id: number;
  step_number: number;
  title: string;
  description?: string;
  source_artifact_id?: number;
  created_at: string;
}

interface SOP {
  id: number;
  title: string;
  description?: string;
  version: number;
  steps: SOPStep[];
  created_at: string;
}

export default function SOPDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sopId = Number(params.id);

  const [sop, setSOP] = useState<SOP | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSOP();
  }, [sopId]);

  const loadSOP = async () => {
    const response = await sops.get(sopId);
    if (!response.error && response.data) {
      setSOP(response.data as SOP);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this SOP?')) {
      await sops.delete(sopId);
      router.push('/dashboard/sops');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!sop) {
    return (
      <div className="p-8">
        <p className="text-slate-600">SOP not found</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <Link href="/dashboard/sops" className="text-blue-600 hover:text-blue-700 mb-2 block">
              ← Back to SOPs
            </Link>
            <h1 className="text-4xl font-bold text-slate-900">{sop.title}</h1>
            {sop.description && (
              <p className="text-slate-600 mt-2">{sop.description}</p>
            )}
            <div className="text-sm text-slate-500 mt-4">
              <span>Version {sop.version}</span>
              <span className="mx-2">•</span>
              <span>{new Date(sop.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-200">
            {sop.steps.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-600">No steps defined for this SOP</p>
              </div>
            ) : (
              sop.steps.map((step, index) => (
                <div key={step.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-blue-900">{step.step_number}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {step.title}
                      </h3>
                      {step.description && (
                        <p className="text-slate-600 mt-2 whitespace-pre-wrap">
                          {step.description}
                        </p>
                      )}
                      {step.source_artifact_id && (
                        <div className="mt-3 text-sm text-slate-500">
                          <span>Source Artifact ID: {step.source_artifact_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
