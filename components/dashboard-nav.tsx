'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export default function DashboardNav() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="w-64 bg-slate-900 text-white p-6 flex flex-col">
      <Link href="/dashboard" className="text-2xl font-bold mb-8">
        Second Brain
      </Link>

      <div className="space-y-4 flex-1">
        <Link
          href="/dashboard"
          className="block px-4 py-2 rounded hover:bg-slate-800 transition"
        >
          Overview
        </Link>
        <Link
          href="/dashboard/artifacts"
          className="block px-4 py-2 rounded hover:bg-slate-800 transition"
        >
          Artifacts
        </Link>
        <Link
          href="/dashboard/sops"
          className="block px-4 py-2 rounded hover:bg-slate-800 transition"
        >
          SOPs
        </Link>
        <Link
          href="/dashboard/templates"
          className="block px-4 py-2 rounded hover:bg-slate-800 transition"
        >
          Templates
        </Link>
      </div>

      <div className="border-t border-slate-700 pt-4">
        <div className="mb-4">
          <p className="text-sm text-slate-400">Logged in as</p>
          <p className="font-medium">{user?.full_name}</p>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full"
        >
          Logout
        </Button>
      </div>
    </nav>
  );
}
