'use client';

import { useState, useEffect } from 'react';
import { artifacts } from '@/lib/api';
import { Button } from '@/components/ui/button';
import CreateArtifactModal from '@/components/create-artifact-modal';
import Link from 'next/link';

interface Artifact {
  id: number;
  title: string;
  description?: string;
  version: number;
  created_at: string;
}

export default function ArtifactsPage() {
  const [artifactList, setArtifactList] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadArtifacts();
  }, []);

  const loadArtifacts = async () => {
    setLoading(true);
    const response = await artifacts.list();
    if (!response.error && response.data) {
      setArtifactList(response.data as Artifact[]);
    }
    setLoading(false);
  };

  const handleArtifactCreated = () => {
    setShowModal(false);
    loadArtifacts();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Artifacts</h1>
          <p className="text-slate-600 mt-2">Manage your knowledge artifacts</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          + New Artifact
        </Button>
      </div>

      {showModal && (
        <CreateArtifactModal
          onClose={() => setShowModal(false)}
          onCreated={handleArtifactCreated}
        />
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
        </div>
      ) : artifactList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">No artifacts yet</h3>
          <p className="text-slate-600 mt-2">Create your first artifact to get started</p>
          <Button className="mt-4" onClick={() => setShowModal(true)}>
            Create Artifact
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {artifactList.map((artifact) => (
            <Link key={artifact.id} href={`/dashboard/artifacts/${artifact.id}`}>
              <div className="p-6 bg-white border border-slate-200 rounded-lg hover:shadow-lg transition cursor-pointer">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {artifact.title}
                </h3>
                {artifact.description && (
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {artifact.description}
                  </p>
                )}
                <div className="flex justify-between items-center text-sm text-slate-500">
                  <span>v{artifact.version}</span>
                  <span>{new Date(artifact.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
