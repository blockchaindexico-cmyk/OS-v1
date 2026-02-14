'use client';

import { useState, useEffect } from 'react';
import { sops } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface SOP {
  id: number;
  title: string;
  description?: string;
  version: number;
  created_at: string;
}

export default function SOPsPage() {
  const [sopList, setSopList] = useState<SOP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSOPs();
  }, []);

  const loadSOPs = async () => {
    setLoading(true);
    const response = await sops.list();
    if (!response.error && response.data) {
      setSopList(response.data as SOP[]);
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">SOPs</h1>
          <p className="text-slate-600 mt-2">Your Standard Operating Procedures</p>
        </div>
        <Link href="/dashboard/artifacts">
          <Button>Create from Artifact</Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
        </div>
      ) : sopList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">No SOPs yet</h3>
          <p className="text-slate-600 mt-2">Create your first SOP from an artifact</p>
          <Link href="/dashboard/artifacts" className="mt-4 inline-block">
            <Button>Go to Artifacts</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sopList.map((sop) => (
            <Link key={sop.id} href={`/dashboard/sops/${sop.id}`}>
              <div className="p-6 bg-white border border-slate-200 rounded-lg hover:shadow-lg transition cursor-pointer">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {sop.title}
                </h3>
                {sop.description && (
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {sop.description}
                  </p>
                )}
                <div className="flex justify-between items-center text-sm text-slate-500">
                  <span>v{sop.version}</span>
                  <span>{new Date(sop.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
