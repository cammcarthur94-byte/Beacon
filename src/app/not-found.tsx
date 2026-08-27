import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-background text-foreground">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">404 - Page Not Found</h1>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button asChild variant="glow" size="sm">
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  );
}
