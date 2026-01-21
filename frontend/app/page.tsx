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

  const [activeTab, setActiveTab] = useState<"generate" | "display">("generate");

  // History State
  const [historyDates, setHistoryDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateRecipes, setDateRecipes] = useState<string[]>([]);
  const [displayedRecipe, setDisplayedRecipe] = useState<RecipeResponse | null>(null);

  // Advanced Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");

  const fetchHistoryDates = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/history/dates");
      if (res.ok) {
        const dates = await res.json();
        setHistoryDates(dates);
      }
    } catch (e) {
      console.error("Failed to fetch dates", e);
    }
  };

  const fetchRecipesForDate = async (date: string) => {
    if (selectedDate === date) {
      // Toggle off if clicking same date
      setSelectedDate(null);
      setDateRecipes([]);
      setDisplayedRecipe(null);
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:8000/api/history/recipes/${date}`);
      if (res.ok) {
        const recipes = await res.json();
        setSelectedDate(date);
        setDateRecipes(recipes);
        setDisplayedRecipe(null); // Clear previous display
      }
    } catch (e) {
      console.error("Failed to fetch recipes", e);
    }
  };

  const fetchRecipeDetail = async (date: string, filename: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/history/recipe/${date}/${filename}`);
      if (res.ok) {
        const data = await res.json();
        // The API returns the full log entry, we need the 'output' part for RecipeResponse
        if (data.output) {
            setDisplayedRecipe(data.output);
        }
      }
    } catch (e) {
      console.error("Failed to fetch recipe detail", e);
    }
  };

  // Fetch dates when switching to display tab
  const handleTabChange = (tab: "generate" | "display") => {
    setActiveTab(tab);
    if (tab === "display") {
      fetchHistoryDates();
    }
  };

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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadRecipe = (targetRecipe: RecipeResponse | null) => {
    if (!targetRecipe) return;
    const jsonString = JSON.stringify(targetRecipe, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${targetRecipe.vibe_match.replace(/[^a-zA-Z0-9]/g, "_")}_recipe.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-8 font-sans">
      <main className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Ricoh GR Series Recipe Generator
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
            Describe a vibe, scene, or emotion, and let AI craft the perfect
            JPEG recipe for your camera.
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex justify-center">
          <div className="bg-zinc-200 dark:bg-zinc-800 p-1 rounded-xl inline-flex">
            <button
              onClick={() => handleTabChange("generate")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "generate"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              Generate
            </button>
            <button
              onClick={() => handleTabChange("display")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "display"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              Display
            </button>
          </div>
        </div>

        {/* Generate Tab Content */}
        {activeTab === "generate" && (
          <div className="space-y-12 animate-in fade-in zoom-in-95 duration-300">
            {/* Input Section */}
            <section className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <textarea
                    className="flex-1 bg-zinc-100 dark:bg-zinc-900 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[160px] resize-y"
                    placeholder="Describe your vibe here... (Markdown supported)"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        generateRecipe();
                      }
                    }}
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
            {recipe && <RecipeResultView recipe={recipe} onDownload={() => downloadRecipe(recipe)} />}
          </div>
        )}

        {/* Display Tab Content */}
        {activeTab === "display" && (
          <div className="animate-in fade-in zoom-in-95 duration-300 grid md:grid-cols-12 gap-8">
            {/* Sidebar: Dates */}
            <div className="md:col-span-3 space-y-6">
                <h2 className="text-2xl font-bold px-2 text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-700 pb-2">History</h2>
                {historyDates.length === 0 ? (
                    <p className="text-zinc-500 px-2 text-sm">No history found.</p>
                ) : (
                    <div className="space-y-3">
                        {historyDates.map((date) => (
                            <div key={date} className="space-y-2">
                                <button
                                    onClick={() => fetchRecipesForDate(date)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-lg font-bold transition-all ${
                                        selectedDate === date
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
                                            : "hover:bg-blue-50 dark:hover:bg-blue-900/30 text-zinc-700 dark:text-zinc-300"
                                    }`}
                                >
                                    {date}
                                </button>
                                {/* Nested Recipe List for this Date */}
                                {selectedDate === date && (
                                    <div className="pl-4 space-y-2 border-l-4 border-blue-500/30 ml-4 py-1">
                                        {dateRecipes.length === 0 ? (
                                             <p className="text-sm text-zinc-400 pl-2 italic">No recipes found.</p>
                                        ) : (
                                            dateRecipes.map((filename) => (
                                                <button
                                                    key={filename}
                                                    onClick={() => fetchRecipeDetail(date, filename)}
                                                    className="block w-full text-left px-3 py-2 text-sm truncate rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 text-zinc-600 dark:text-zinc-400 font-medium transition-colors"
                                                    title={filename}
                                                >
                                                    {filename.replace(".json", "").replace(/_/g, " ")}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content: Recipe Detail */}
            <div className="md:col-span-9">
                {displayedRecipe ? (
                    <RecipeResultView recipe={displayedRecipe} onDownload={() => downloadRecipe(displayedRecipe)} small />
                ) : (
                    <div className="h-full min-h-[500px] flex items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl bg-white/50 dark:bg-zinc-800/50">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                            </div>
                            <p className="text-zinc-500 font-medium">Select a recipe from history to view details</p>
                        </div>
                    </div>
                )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Extracted Result View Component to reuse
function RecipeResultView({ recipe, onDownload, small = false }: { recipe: RecipeResponse, onDownload: () => void, small?: boolean }) {
  return (
    <div className={`grid gap-8 ${small ? "md:grid-cols-1" : "md:grid-cols-2"}`}>
    {/* Left Column: Overview & Global */}
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
        <div className="flex justify-between items-start mb-2">
          <div className="uppercase tracking-wide text-sm font-bold text-blue-500">
            Result
          </div>
          <button
            onClick={onDownload}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors font-medium text-zinc-600 dark:text-zinc-300"
            title="Download Recipe JSON"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download JSON
          </button>
        </div>
        <h2 className={`${small ? "text-2xl" : "text-4xl"} font-bold mb-2`}>{recipe.vibe_match}</h2>
        <p className={`text-zinc-500 dark:text-zinc-400 ${small ? "text-base" : "text-lg"} mb-6 italic`}>
          &quot;{recipe.note}&quot;
        </p>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-700">
            <span className={`font-medium ${small ? "text-base" : "text-lg"} text-zinc-500`}>Base Mode</span>
            <span className={`font-bold ${small ? "text-lg" : "text-xl"}`}>{recipe.base_mode}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-700">
            <span className={`font-medium ${small ? "text-base" : "text-lg"} text-zinc-500`}>HDF</span>
            <span
              className={`font-bold ${small ? "text-lg" : "text-xl"} ${
                recipe.global_settings.hdf_recommendation === "ON"
                  ? "text-purple-500"
                  : ""
              }`}
            >
              {recipe.global_settings.hdf_recommendation}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-700">
            <span className={`font-medium ${small ? "text-base" : "text-lg"} text-zinc-500`}>Exposure</span>
            <span className={`font-bold ${small ? "text-lg" : "text-xl"}`}>
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
            <span className={`font-bold ${small ? "text-lg" : "text-xl"}`}>
              {recipe.global_settings.wb_setting}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg text-center">
              <div className="text-sm text-zinc-500 mb-1">A-B Axis</div>
              <div className={`font-mono font-bold ${small ? "text-xl" : "text-2xl"}`}>
                {recipe.global_settings.wb_shift_a > 0 ? "+" : ""}
                {recipe.global_settings.wb_shift_a}
              </div>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg text-center">
              <div className="text-sm text-zinc-500 mb-1">G-M Axis</div>
              <div className={`font-mono font-bold ${small ? "text-xl" : "text-2xl"}`}>
                {recipe.global_settings.wb_shift_g > 0 ? "+" : ""}
                {recipe.global_settings.wb_shift_g}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Right Column: Parameters */}
    <div className={`bg-zinc-900 text-zinc-100 p-6 rounded-2xl shadow-xl flex flex-col justify-center ${small ? "mt-4" : ""}`}>
      <h3 className={`font-bold mb-6 text-zinc-400 uppercase tracking-widest text-center ${small ? "text-lg" : "text-xl"}`}>
        Image Control Settings
      </h3>
      <div className="space-y-3">
        <ParamRow
          label="Saturation"
          value={recipe.parameters.saturation}
          small={small}
        />
        <ParamRow label="Hue" value={recipe.parameters.hue} small={small} />
        <ParamRow
          label="High/Low Key"
          value={recipe.parameters.high_low_key}
          small={small}
        />
        <ParamRow label="Contrast" value={recipe.parameters.contrast} small={small} />
        <ParamRow
          label="Contrast (Highlight)"
          value={recipe.parameters.contrast_highlight}
          small={small}
        />
        <ParamRow
          label="Contrast (Shadow)"
          value={recipe.parameters.contrast_shadow}
          small={small}
        />
        <ParamRow label="Sharpness" value={recipe.parameters.sharpness} small={small} />
        <ParamRow label="Shading" value={recipe.parameters.shading} small={small} />
        <ParamRow label="Clarity" value={recipe.parameters.clarity} small={small} />
      </div>
    </div>
  </div>
  );
}

function ParamRow({ label, value, small = false }: { label: string; value: number, small?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-zinc-800 last:border-0">
      <span className={`${small ? "text-base" : "text-lg"} font-medium text-zinc-400`}>{label}</span>
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
        <span className={`font-mono font-bold w-8 text-right ${small ? "text-lg" : "text-xl"}`}>
          {value > 0 ? "+" : ""}
          {value}
        </span>
      </div>
    </div>
  );
}