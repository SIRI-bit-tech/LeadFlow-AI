import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-4">
            <img src="/logo-icon.svg" alt="LeadFlow AI" className="w-16 h-16" />
            <span className="text-4xl font-bold text-primary">LeadFlow AI</span>
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8">
          {children}
        </div>
      </div>
    </div>
  );
}