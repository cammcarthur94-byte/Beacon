'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { RotateCw } from 'lucide-react';

function QueueRedirectContent() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/settings?tab=queue');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
      <RotateCw className="w-6 h-6 text-indigo-600 animate-spin" />
      <span className="text-xs text-slate-500 font-medium">
        Redirecting to Queue Status...
      </span>
    </div>
  );
}

export default function QueueRedirectPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
          <RotateCw className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
      }
    >
      <QueueRedirectContent />
    </React.Suspense>
  );
}
