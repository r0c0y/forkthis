export default function LearnForkPage() {
  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">🧠 Learn How to Fork a Repo</h1>
      <p className="mb-4 text-gray-600">
        Forking a GitHub repo allows you to create your own copy so you can work on it, explore the code, and contribute back.
      </p>

      <ol className="list-decimal list-inside space-y-3 text-sm">
        <li>Go to the GitHub repository (e.g. <code>vercel/next.js</code>)</li>
        <li>Click on the <strong>Fork</strong> button (top-right)</li>
        <li>GitHub will create a copy under your username</li>
        <li>You can now clone it locally with <code>git clone &lt;your-fork-url&gt;</code></li>
        <li>Make changes, commit, push and open a pull request to contribute back</li>
      </ol>
    </main>
  );
}
