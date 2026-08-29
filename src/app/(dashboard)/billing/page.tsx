'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RotateCw } from 'lucide-react';

function BillingRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.set('tab', 'billing');
    router.replace(`/settings?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
      <RotateCw className="w-6 h-6 text-indigo-600 animate-spin" />
      <span className="text-xs text-slate-500 font-medium">
        Redirecting to Settings & Billing...
      </span>
    </div>
  );
}

export default function BillingRedirectPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
          <RotateCw className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
      }
    >
      <BillingRedirectContent />
    </React.Suspense>
  );
}
