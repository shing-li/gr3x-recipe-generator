"use client";

import { useState } from "react";

interface GlobalSettings {
  exposure_recommendation: string;
  wb_setting: string;
  wb_shift_a: number;
  wb_shift_g: number;
  hdf_recommendation: string;
}

interface Parameters {
  saturation: number;
  hue: number;
  high_low_key: number;
  contrast: number;
  contrast_highlight: number;
  contrast_shadow: number;
  sharpness: number;
  shading: number;
  clarity: number;
}

interface RecipeResponse {
  vibe_match: string;
  base_mode: string;
  global_settings: GlobalSettings;
  parameters: Parameters;
  note: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Advanced Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");

  const generateRecipe = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setRecipe(null);

    try {
      const body = {
        prompt,
        api_key: apiKey.trim() || undefined,
        base_url: baseUrl.trim() || undefined,
        model: model.trim() || undefined,
      };

      const res = await fetch("http://localhost:8000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to generate recipe");
      }

      const data: RecipeResponse = await res.json();
      setRecipe(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-8 font-sans">
      <main className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Ricoh GR IIIx Recipe Generator
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
            Describe a vibe, scene, or emotion, and let AI craft the perfect
            JPEG recipe for your camera.
          </p>
        </header>

        {/* Input Section */}
        <section className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                className="flex-1 bg-zinc-100 dark:bg-zinc-900 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g., Cyberpunk Tokyo night rain, Melancholy Sunday morning..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generateRecipe()}
              />
              <button
                onClick={generateRecipe}
                disabled={loading || !prompt.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white font-medium px-8 py-3 rounded-xl transition-colors min-w-[120px]"
              >
                {loading ? "Crafting..." : "Generate"}
              </button>
            </div>
            
            {/* Advanced Settings Toggle */}
            <div className="flex justify-end">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="text-sm text-zinc-500 hover:text-blue-500 transition-colors flex items-center gap-1"
              >
                {showSettings ? "Hide Settings" : "Advanced Settings"}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
              </button>
            </div>

            {/* Advanced Settings Panel */}
            {showSettings && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-700 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">API Key (Optional)</label>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Base URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://api.openai.com/v1"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Model Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="gpt-4o"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>
          {error && (
            <p className="mt-4 text-red-500 text-sm font-medium">{error}</p>
          )}
        </section>

        {/* Result Section */}
        {recipe && (
          <div className="grid gap-8 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Column: Overview & Global */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                <div className="uppercase tracking-wide text-sm font-bold text-blue-500 mb-2">
                  Result
                </div>
                <h2 className="text-4xl font-bold mb-2">{recipe.vibe_match}</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-6 italic">
                  "{recipe.note}"
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-700">
                    <span className="font-medium text-lg text-zinc-500">Base Mode</span>
                    <span className="font-bold text-xl">{recipe.base_mode}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-700">
                    <span className="font-medium text-lg text-zinc-500">HDF</span>
                    <span
                      className={`font-bold text-xl ${
                        recipe.global_settings.hdf_recommendation === "ON"
                          ? "text-purple-500"
                          : ""
                      }`}
                    >
                      {recipe.global_settings.hdf_recommendation}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-700">
                    <span className="font-medium text-lg text-zinc-500">Exposure</span>
                    <span className="font-bold text-xl">
                      {recipe.global_settings.exposure_recommendation}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                <h3 className="text-2xl font-bold mb-4">White Balance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-lg">Setting</span>
                    <span className="font-bold text-xl">
                      {recipe.global_settings.wb_setting}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg text-center">
                      <div className="text-sm text-zinc-500 mb-1">A-B Axis</div>
                      <div className="font-mono font-bold text-2xl">
                        {recipe.global_settings.wb_shift_a > 0 ? "+" : ""}
                        {recipe.global_settings.wb_shift_a}
                      </div>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg text-center">
                      <div className="text-sm text-zinc-500 mb-1">G-M Axis</div>
                      <div className="font-mono font-bold text-2xl">
                        {recipe.global_settings.wb_shift_g > 0 ? "+" : ""}
                        {recipe.global_settings.wb_shift_g}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Parameters */}
            <div className="bg-zinc-900 text-zinc-100 p-6 rounded-2xl shadow-xl flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-6 text-zinc-400 uppercase tracking-widest text-center">
                Image Control Settings
              </h3>
              <div className="space-y-3">
                <ParamRow
                  label="Saturation"
                  value={recipe.parameters.saturation}
                />
                <ParamRow label="Hue" value={recipe.parameters.hue} />
                <ParamRow
                  label="High/Low Key"
                  value={recipe.parameters.high_low_key}
                />
                <ParamRow label="Contrast" value={recipe.parameters.contrast} />
                <ParamRow
                  label="Contrast (Highlight)"
                  value={recipe.parameters.contrast_highlight}
                />
                <ParamRow
                  label="Contrast (Shadow)"
                  value={recipe.parameters.contrast_shadow}
                />
                <ParamRow label="Sharpness" value={recipe.parameters.sharpness} />
                <ParamRow label="Shading" value={recipe.parameters.shading} />
                <ParamRow label="Clarity" value={recipe.parameters.clarity} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ParamRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-zinc-800 last:border-0">
      <span className="text-lg font-medium text-zinc-400">{label}</span>
      <div className="flex items-center gap-3">
        {/* Simple visual indicator */}
        <div className="hidden sm:flex gap-0.5">
          {Array.from({ length: 9 }).map((_, i) => {
            const step = i - 4; // -4 to +4
            const isActive =
              value >= 0
                ? step >= 0 && step <= value
                : step <= 0 && step >= value;
            
            // Only show center dot if value is 0
            if (value === 0 && step !== 0) return <div key={i} className="w-1 h-1" />; 
            if (value === 0 && step === 0) return <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />;

            return (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? "bg-blue-500" : "bg-zinc-700"
                } ${step === 0 ? "mx-1" : ""}`}
              />
            );
          })}
        </div>
        <span className="font-mono font-bold w-8 text-right text-xl">
          {value > 0 ? "+" : ""}
          {value}
        </span>
      </div>
    </div>
  );
}