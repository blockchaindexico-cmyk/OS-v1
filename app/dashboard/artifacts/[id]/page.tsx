'use client';

import { useState, useEffect } from 'react';
import { artifacts, templates } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Artifact {
  id: number;
  title: string;
  description?: string;
  content: string;
  version: number;
  created_at: string;
  is_promoted_to_template: boolean;
}

interface ArtifactVersion {
  id: number;
  version_number: number;
  content: string;
  change_summary?: string;
  created_at: string;
}

export default function ArtifactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const artifactId = Number(params.id);

  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [versions, setVersions] = useState<ArtifactVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [changeSummary, setChangeSummary] = useState('');
  const [showPromote, setShowPromote] = useState(false);

  useEffect(() => {
    loadArtifact();
  }, [artifactId]);

  const loadArtifact = async () => {
    setLoading(true);
    const response = await artifacts.get(artifactId);
    if (!response.error && response.data) {
      const art = response.data as any;
      setArtifact(art);
      setTitle(art.title);
      setDescription(art.description || '');
      setContent(art.content);
      setVersions(art.versions || []);
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    const response = await artifacts.update(
      artifactId,
      title,
      description,
      content,
      changeSummary
    );
    if (!response.error) {
      setIsEditing(false);
      setChangeSummary('');
      loadArtifact();
    }
  };

  const handlePromote = async () => {
    const sanitizationChecklist = {
      'Removed sensitive data': false,
      'Anonymized examples': false,
      'Verified accuracy': false,
      'Updated references': false,
    };

    const response = await templates.promote(artifactId, sanitizationChecklist);
    if (!response.error) {
      setShowPromote(false);
      loadArtifact();
    }
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
        <div className="flex justify-between items-start mb-8">
          <div>
            <Link href="/dashboard/artifacts" className="text-blue-600 hover:text-blue-700 mb-2 block">
              ← Back to Artifacts
            </Link>
            {isEditing ? (
              <>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-3xl font-bold mb-4"
                />
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  className="text-slate-600 mb-4"
                />
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold text-slate-900">{artifact.title}</h1>
                {artifact.description && (
                  <p className="text-slate-600 mt-2">{artifact.description}</p>
                )}
              </>
            )}
            <div className="text-sm text-slate-500 mt-4">
              <span>Version {artifact.version}</span>
              {artifact.is_promoted_to_template && (
                <span className="ml-4 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  Promoted to Template
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleUpdate}>Save</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)}>Edit</Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPromote(true)}
                  disabled={artifact.is_promoted_to_template}
                >
                  {artifact.is_promoted_to_template ? 'Promoted' : 'Promote to Template'}
                </Button>
                <Link href={`/dashboard/build-sop/${artifact.id}`}>
                  <Button variant="outline">Use in SOP</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {showPromote && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-3">Promote to Template</h3>
            <p className="text-slate-700 mb-4 text-sm">
              Please verify the following sanitization checklist before promoting:
            </p>
            <div className="space-y-2 mb-4">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-slate-700">Removed sensitive data</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-slate-700">Anonymized examples</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-slate-700">Verified accuracy</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-slate-700">Updated references</span>
              </label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePromote}>Confirm Promotion</Button>
              <Button variant="outline" onClick={() => setShowPromote(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Content</h2>
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[300px] font-mono text-sm"
            />
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 max-h-[400px] overflow-auto">
              {artifact.content}
            </pre>
          )}
        </div>

        {isEditing && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Change Summary</h2>
            <textarea
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="Describe what changed in this version"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[100px]"
            />
          </div>
        )}

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Version History</h2>
          <div className="space-y-3">
            {versions.slice().reverse().map((version) => (
              <div key={version.id} className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-slate-900">v{version.version_number}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(version.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {version.change_summary && (
                  <p className="text-sm text-slate-700 mt-2">{version.change_summary}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
