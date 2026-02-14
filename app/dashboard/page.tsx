'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Welcome, {user?.full_name}
        </h1>
        <p className="text-slate-600 mb-8">
          Organize your knowledge with artifacts, build structured SOPs, and share templates with your team.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/artifacts" className="group">
            <div className="p-6 bg-white border border-slate-200 rounded-lg hover:shadow-lg transition">
              <h2 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-blue-600">
                Artifacts
              </h2>
              <p className="text-slate-600">
                Create and manage knowledge artifacts with version tracking
              </p>
            </div>
          </Link>

          <Link href="/dashboard/sops" className="group">
            <div className="p-6 bg-white border border-slate-200 rounded-lg hover:shadow-lg transition">
              <h2 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-blue-600">
                SOPs
              </h2>
              <p className="text-slate-600">
                Build structured standard operating procedures from your artifacts
              </p>
            </div>
          </Link>

          <Link href="/dashboard/templates" className="group">
            <div className="p-6 bg-white border border-slate-200 rounded-lg hover:shadow-lg transition">
              <h2 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-blue-600">
                Templates
              </h2>
              <p className="text-slate-600">
                Promote artifacts to templates and share across your organization
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Getting Started</h3>
          <p className="text-slate-700 mb-4">
            Start by creating your first artifact. Artifacts are the building blocks of your knowledge base.
          </p>
          <Link href="/dashboard/artifacts">
            <Button>Create First Artifact</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
