"use client";

import { useState } from "react";

const TABS = ["Overview", "Quick Start", "API Reference", "SDKs"] as const;
type Tab = (typeof TABS)[number];

const CODE_EXAMPLE_PYTHON = `import prophetarena as pa

client = pa.Client(api_key="pa_live_...")

# Create a forecast
forecast = client.forecasts.create(
    question="Will BTC exceed $150k by end of Q2 2026?",
    outcomes=["Yes", "No"],
    model="claude-opus-4-6",
    search_backend="perplexity",
)

print(forecast.probabilities)
# {"Yes": 0.42, "No": 0.58}`;

const CODE_EXAMPLE_TS = `import { ProphetArena } from "@prophetarena/sdk";

const client = new ProphetArena({ apiKey: "pa_live_..." });

const forecast = await client.forecasts.create({
  question: "Will BTC exceed $150k by end of Q2 2026?",
  outcomes: ["Yes", "No"],
  model: "claude-opus-4-6",
  searchBackend: "perplexity",
});

console.log(forecast.probabilities);
// { Yes: 0.42, No: 0.58 }`;

const CODE_EXAMPLE_CURL = `curl -X POST https://api.prophetarena.co/v1/forecasts \\
  -H "Authorization: Bearer pa_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "question": "Will BTC exceed $150k by end of Q2 2026?",
    "outcomes": ["Yes", "No"],
    "model": "claude-opus-4-6",
    "search_backend": "perplexity"
  }'`;

const ENDPOINTS = [
  { method: "POST", path: "/v1/forecasts", desc: "Create a new forecast" },
  { method: "GET", path: "/v1/forecasts/:id", desc: "Retrieve a forecast by ID" },
  { method: "GET", path: "/v1/forecasts/:id/stream", desc: "Stream forecast progress (SSE)" },
  { method: "GET", path: "/v1/forecasts", desc: "List all forecasts" },
  { method: "DELETE", path: "/v1/forecasts/:id", desc: "Cancel a running forecast" },
  { method: "GET", path: "/v1/models", desc: "List available models" },
  { method: "GET", path: "/v1/usage", desc: "Get API usage stats" },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "text-green-400 bg-green-400/10",
  POST: "text-blue-400 bg-blue-400/10",
  DELETE: "text-red-400 bg-red-400/10",
};

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl bg-ground border border-edge overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-edge">
        <span className="text-[11px] text-muted font-mono uppercase">{lang}</span>
        <button
          onClick={handleCopy}
          className="text-[11px] text-muted hover:text-secondary transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-xs text-secondary overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-primary mb-2">Build with forecasts</h3>
        <p className="text-sm text-secondary leading-relaxed max-w-2xl">
          The Prophet Arena API lets you programmatically generate calibrated probability
          forecasts for any question. Our agent pipeline searches the web, gathers evidence,
          and produces outcome probabilities — all through a single API call.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: "Agent-powered",
            desc: "LLM agents search, analyze sources, and reason about evidence before forecasting.",
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            ),
          },
          {
            title: "Multi-model",
            desc: "Choose from Claude, GPT, Gemini, and more. Compare forecasts across models.",
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            ),
          },
          {
            title: "Real-time streaming",
            desc: "Stream agent steps as they happen via SSE. See searches, sources, and reasoning live.",
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            ),
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-edge bg-surface p-5 space-y-2"
          >
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                {card.icon}
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-primary">{card.title}</h4>
            <p className="text-xs text-secondary leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-primary mb-3">Rate limits</h4>
        <div className="rounded-xl border border-edge bg-surface overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-edge text-left text-muted">
                <th className="px-4 py-2.5 font-medium">Plan</th>
                <th className="px-4 py-2.5 font-medium">Requests / min</th>
                <th className="px-4 py-2.5 font-medium">Concurrent</th>
                <th className="px-4 py-2.5 font-medium">Monthly forecasts</th>
              </tr>
            </thead>
            <tbody className="text-secondary">
              <tr className="border-b border-edge">
                <td className="px-4 py-2.5 text-primary font-medium">Free</td>
                <td className="px-4 py-2.5">5</td>
                <td className="px-4 py-2.5">1</td>
                <td className="px-4 py-2.5">50</td>
              </tr>
              <tr className="border-b border-edge">
                <td className="px-4 py-2.5 text-primary font-medium">Pro</td>
                <td className="px-4 py-2.5">30</td>
                <td className="px-4 py-2.5">5</td>
                <td className="px-4 py-2.5">1,000</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-primary font-medium">Enterprise</td>
                <td className="px-4 py-2.5">200</td>
                <td className="px-4 py-2.5">50</td>
                <td className="px-4 py-2.5">Unlimited</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function QuickStartTab() {
  const [lang, setLang] = useState<"python" | "typescript" | "curl">("python");

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-primary mb-2">Quick start</h3>
        <p className="text-sm text-secondary leading-relaxed max-w-2xl">
          Get your first forecast in under a minute. Grab an API key from your
          dashboard, install the SDK, and make a request.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">1</span>
          <span className="text-sm text-primary font-medium">Install the SDK</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CodeBlock code="pip install prophetarena" lang="pip" />
          <CodeBlock code="npm install @prophetarena/sdk" lang="npm" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">2</span>
          <span className="text-sm text-primary font-medium">Create a forecast</span>
        </div>
        <div className="flex gap-2 mb-3">
          {(["python", "typescript", "curl"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                lang === l
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-muted hover:text-secondary"
              }`}
            >
              {l === "typescript" ? "TypeScript" : l === "python" ? "Python" : "cURL"}
            </button>
          ))}
        </div>
        <CodeBlock
          code={lang === "python" ? CODE_EXAMPLE_PYTHON : lang === "typescript" ? CODE_EXAMPLE_TS : CODE_EXAMPLE_CURL}
          lang={lang}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">3</span>
          <span className="text-sm text-primary font-medium">Stream agent progress (optional)</span>
        </div>
        <CodeBlock
          code={`# Subscribe to the forecast stream\nfor event in client.forecasts.stream(forecast.id):\n    if event.type == "search":\n        print(f"Searching: {event.query}")\n    elif event.type == "source_added":\n        print(f"Source: {event.title}")\n    elif event.type == "complete":\n        print(f"Result: {event.probabilities}")`}
          lang="python"
        />
      </div>
    </div>
  );
}

function ApiReferenceTab() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-primary mb-2">API Reference</h3>
        <p className="text-sm text-secondary leading-relaxed max-w-2xl">
          All endpoints are served from <code className="px-1.5 py-0.5 rounded-md bg-ground border border-edge text-xs text-accent font-mono">https://api.prophetarena.co/v1</code>. Authenticate
          with a Bearer token in the Authorization header.
        </p>
      </div>

      <div className="space-y-2">
        {ENDPOINTS.map((ep) => (
          <div
            key={ep.method + ep.path}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-edge bg-surface hover:border-accent/30 transition-colors"
          >
            <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-md ${METHOD_COLORS[ep.method]}`}>
              {ep.method}
            </span>
            <code className="text-xs text-primary font-mono flex-1">{ep.path}</code>
            <span className="text-xs text-muted hidden sm:block">{ep.desc}</span>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-primary mb-3">Request body — POST /v1/forecasts</h4>
        <div className="rounded-xl border border-edge bg-surface overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-edge text-left text-muted">
                <th className="px-4 py-2.5 font-medium">Field</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Required</th>
                <th className="px-4 py-2.5 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-secondary">
              {[
                ["question", "string", "Yes", "The question to forecast"],
                ["outcomes", "string[]", "No", "Possible outcomes (auto-generated if omitted)"],
                ["model", "string", "No", 'Model to use (default: "claude-opus-4-6")'],
                ["search_backend", "string", "No", '"perplexity", "brave", or "exa"'],
                ["max_steps", "integer", "No", "Max agent steps (default: 15, max: 50)"],
                ["webhook_url", "string", "No", "URL to POST results when complete"],
              ].map(([field, type, required, desc]) => (
                <tr key={field} className="border-b border-edge last:border-0">
                  <td className="px-4 py-2.5 font-mono text-accent">{field}</td>
                  <td className="px-4 py-2.5 font-mono text-muted">{type}</td>
                  <td className="px-4 py-2.5">{required}</td>
                  <td className="px-4 py-2.5">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-primary mb-3">Response — 201 Created</h4>
        <CodeBlock
          code={`{
  "id": "fc_a1b2c3d4",
  "status": "running",
  "question": "Will BTC exceed $150k by end of Q2 2026?",
  "outcomes": ["Yes", "No"],
  "model": "claude-opus-4-6",
  "probabilities": null,
  "sources": [],
  "created_at": "2026-03-08T12:00:00Z",
  "stream_url": "/v1/forecasts/fc_a1b2c3d4/stream"
}`}
          lang="json"
        />
      </div>
    </div>
  );
}

function SdksTab() {
  const sdks = [
    {
      name: "Python",
      pkg: "prophetarena",
      install: "pip install prophetarena",
      version: "0.4.2",
      icon: "py",
    },
    {
      name: "TypeScript / Node",
      pkg: "@prophetarena/sdk",
      install: "npm install @prophetarena/sdk",
      version: "0.3.1",
      icon: "ts",
    },
    {
      name: "Go",
      pkg: "github.com/prophetarena/go-sdk",
      install: "go get github.com/prophetarena/go-sdk",
      version: "0.2.0",
      icon: "go",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-primary mb-2">SDKs & Libraries</h3>
        <p className="text-sm text-secondary leading-relaxed max-w-2xl">
          Official client libraries for popular languages. All SDKs support streaming,
          async operations, and automatic retries.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {sdks.map((sdk) => (
          <div
            key={sdk.name}
            className="rounded-xl border border-edge bg-surface p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-primary">{sdk.name}</h4>
              <span className="text-[11px] text-muted font-mono">v{sdk.version}</span>
            </div>
            <code className="block text-xs text-muted font-mono">{sdk.pkg}</code>
            <div className="rounded-lg bg-ground border border-edge px-3 py-2">
              <code className="text-xs text-secondary font-mono">{sdk.install}</code>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-primary mb-3">Community libraries</h4>
        <div className="rounded-xl border border-edge bg-surface p-5">
          <div className="space-y-3">
            {[
              { name: "prophetarena-rs", lang: "Rust", author: "@rustacean42" },
              { name: "prophet-rb", lang: "Ruby", author: "@forecastgem" },
              { name: "ProphetArena.jl", lang: "Julia", author: "@juliaforecast" },
            ].map((lib) => (
              <div key={lib.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <code className="text-xs text-accent font-mono">{lib.name}</code>
                  <span className="text-[11px] text-muted">{lib.lang}</span>
                </div>
                <span className="text-[11px] text-muted">by {lib.author}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DeveloperContent() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  return (
    <div className="w-full max-w-4xl mx-auto px-6 pt-8 pb-16">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-edge mb-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors relative ${
              activeTab === tab
                ? "text-accent"
                : "text-muted hover:text-secondary"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Overview" && <OverviewTab />}
      {activeTab === "Quick Start" && <QuickStartTab />}
      {activeTab === "API Reference" && <ApiReferenceTab />}
      {activeTab === "SDKs" && <SdksTab />}
    </div>
  );
}
