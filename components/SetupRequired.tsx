export default function SetupRequired() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-10 bg-blue-500 rounded-full shrink-0" />
          <div>
            <h1 className="text-2xl font-bold text-blue-900">FAMILY</h1>
            <p className="text-sm text-gray-500">Builders & Developers</p>
          </div>
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Setup required</h2>
        <p className="text-sm text-gray-600 mb-4">
          Supabase URL and API key are missing. Add them so the app can connect to your database.
        </p>
        <ol className="text-sm text-gray-700 list-decimal list-inside space-y-2 mb-4">
          <li>
            Create a file named <code className="bg-gray-100 px-1.5 py-0.5 rounded">.env.local</code> in the project root (same folder as <code className="bg-gray-100 px-1.5 py-0.5 rounded">package.json</code>).
          </li>
          <li>
            Add these two lines (replace with your real values from Supabase):
          </li>
        </ol>
        <pre className="bg-gray-900 text-gray-100 text-xs p-4 rounded-lg overflow-x-auto mb-4">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
        </pre>
        <p className="text-sm text-gray-600 mb-4">
          Get the values from your Supabase project:{" "}
          <a
            href="https://supabase.com/dashboard/project/_/settings/api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium underline"
          >
            Project Settings → API
          </a>
        </p>
        <p className="text-xs text-gray-500">
          After saving <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code>, restart the dev server (stop and run <code className="bg-gray-100 px-1 py-0.5 rounded">npm run dev</code> again).
        </p>
      </div>
    </div>
  );
}
