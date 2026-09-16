import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-6">
      <div className="text-center space-y-8 max-w-md">
        <div className="text-8xl font-black gradient-text">404</div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[hsl(210_20%_95%)]">
            Page Not Found
          </h1>
          <p className="text-[hsl(215_16%_65%)]">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link id="not-found-home-btn" href="/" className="btn btn-primary">
            <Home size={16} />
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
