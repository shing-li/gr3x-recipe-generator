"use client";

import { useState, useEffect, ClipboardEvent } from "react";
import { DEMO_RECIPES, DemoItem } from "./data/demos";

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
  const [selectedImages, setSelectedImages] = useState<string[]>([]); // Array of Base64 strings
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<"generate" | "history" | "demo" | "personal">("demo");

  // History State
  const [historyDates, setHistoryDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateRecipes, setDateRecipes] = useState<string[]>([]);
  const [historyRecipe, setHistoryRecipe] = useState<RecipeResponse | null>(null);

  // Personal State
  const [personalRecipes, setPersonalRecipes] = useState<RecipeResponse[]>([]);
  const [selectedPersonalIdx, setSelectedPersonalIdx] = useState<number | null>(null);

  // Demo State
  const [selectedDemo, setSelectedDemo] = useState<DemoItem | null>(null);

  // Advanced Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");

  // Load personal recipes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("personal_recipes");
    if (saved) {
      try {
        setPersonalRecipes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load personal recipes", e);
      }
    }
  }, []);

  // Save personal recipes to localStorage when updated
  useEffect(() => {
    localStorage.setItem("personal_recipes", JSON.stringify(personalRecipes));
  }, [personalRecipes]);

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
      setHistoryRecipe(null);
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:8000/api/history/recipes/${date}`);
      if (res.ok) {
        const recipes = await res.json();
        setSelectedDate(date);
        setDateRecipes(recipes);
        setHistoryRecipe(null); // Clear previous history
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
            setHistoryRecipe(data.output);
        }
      }
    } catch (e) {
      console.error("Failed to fetch recipe detail", e);
    }
  };

  // Fetch dates when switching to history tab
  const handleTabChange = (tab: "generate" | "history" | "demo" | "personal") => {
    setActiveTab(tab);
    if (tab === "history") {
      fetchHistoryDates();
    }
    // Reset selections when switching tabs
    if (tab !== "history") {
        setHistoryRecipe(null);
        setSelectedDate(null);
    }
    if (tab !== "demo") {
        setSelectedDemo(null);
    }
    if (tab !== "personal") {
        setSelectedPersonalIdx(null);
    }
  };

  const handleDemoSelect = (demo: DemoItem) => {
      setSelectedDemo(demo);
  };

  const COLORIST_SYS_PROMPT = "Generate a Ricoh GR recipe based on the following input. If an image is provided, analyze its aesthetic and colors to create a matching configuration.";

  const pinRecipe = (targetRecipe: RecipeResponse) => {
    // Check if already exists (simple title match)
    if (personalRecipes.some(r => r.vibe_match === targetRecipe.vibe_match && JSON.stringify(r.parameters) === JSON.stringify(targetRecipe.parameters))) {
        alert("Recipe already in Personal list!");
        return;
    }
    setPersonalRecipes([targetRecipe, ...personalRecipes]);
    alert("Pinned to Personal Recipes!");
  };

  const removePersonalRecipe = (index: number) => {
    const newList = [...personalRecipes];
    newList.splice(index, 1);
    setPersonalRecipes(newList);
    if (selectedPersonalIdx === index) {
        setSelectedPersonalIdx(null);
    } else if (selectedPersonalIdx !== null && selectedPersonalIdx > index) {
        setSelectedPersonalIdx(selectedPersonalIdx - 1);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target?.result as string);
            // Basic validation
            if (json.vibe_match && json.global_settings && json.parameters) {
                setPersonalRecipes([json, ...personalRecipes]);
                alert("Recipe uploaded successfully!");
            } else {
                alert("Invalid recipe format.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to parse JSON file.");
        }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = "";
  };

  const processFile = (file: File): Promise<string> => {
      return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
              const img = new Image();
              img.onload = () => {
                  const canvas = document.createElement("canvas");
                  let width = img.width;
                  let height = img.height;
                  // Reduced max dimension to improve performance with multiple images
                  const maxDim = 768;

                  if (width > maxDim || height > maxDim) {
                      if (width > height) {
                          height *= maxDim / width;
                          width = maxDim;
                      } else {
                          width *= maxDim / height;
                          height = maxDim;
                      }
                  }

                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext("2d");
                  ctx?.drawImage(img, 0, 0, width, height);
                  
                  // Compress to JPEG with 0.8 quality
                  const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
                  resolve(dataUrl);
              };
              img.src = e.target?.result as string;
          };
          reader.readAsDataURL(file);
      });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
        const base64 = await processFile(files[i]);
        newImages.push(base64);
    }
    setSelectedImages([...selectedImages, ...newImages]);
    // Reset input
    e.target.value = "";
  };

  const handlePaste = async (e: ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData.items;
      const newImages: string[] = [];
      
      for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
              const file = items[i].getAsFile();
              if (file) {
                  e.preventDefault(); // Prevent pasting the binary code text
                  const base64 = await processFile(file);
                  newImages.push(base64);
              }
          }
      }
      
      if (newImages.length > 0) {
          setSelectedImages([...selectedImages, ...newImages]);
      }
  };

  const removeImage = (index: number) => {
      const newImages = [...selectedImages];
      newImages.splice(index, 1);
      setSelectedImages(newImages);
  };

  const generateRecipe = async () => {
    if (!prompt.trim() && selectedImages.length === 0) return;

    setLoading(true);
    setError("");
    setRecipe(null);

    try {
      const fullPrompt = `${COLORIST_SYS_PROMPT}\n\n\"${prompt}\"`;

      const body = {
        prompt: fullPrompt,
        images: selectedImages.length > 0 ? selectedImages : undefined,
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
      <main className="max-w-6xl mx-auto space-y-8">
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
              onClick={() => handleTabChange("demo")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "demo" ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
            >
              Demo
            </button>
            <button
              onClick={() => handleTabChange("generate")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "generate" ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
            >
              Generate
            </button>
            <button
              onClick={() => handleTabChange("personal")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "personal" ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
            >
              Personal
            </button>
            <button
              onClick={() => handleTabChange("history")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "history" ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
            >
              History
            </button>
          </div>
        </div>

        {/* Generate Tab Content */}
        {activeTab === "generate" && (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-300">
            {/* Input Section */}
            <section className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-1 flex flex-col gap-2 w-full">
                    <textarea
                      className="bg-zinc-100 dark:bg-zinc-900 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[160px] resize-y w-full"
                      placeholder="Describe your vibe here... (Markdown supported) or Paste an image (Ctrl+V)"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onPaste={handlePaste}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
                          generateRecipe();
                        }
                      }}
                    />
                    
                    {/* Image Preview & Upload */}
                    <div className="flex flex-wrap items-center gap-4">
                        <label className="cursor-pointer flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium text-zinc-600 dark:text-zinc-400 h-12">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                            Add Images
                            <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                        </label>
                        
                        {selectedImages.map((img, idx) => (
                            <div key={idx} className="relative group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img} alt={`Preview ${idx}`} className="h-12 w-12 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700" />
                                <button 
                                    onClick={() => removeImage(idx)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                  </div>

                  <button
                    onClick={generateRecipe}
                    disabled={loading || (!prompt.trim() && selectedImages.length === 0)}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white font-medium px-8 py-3 rounded-xl transition-colors min-w-[120px] self-start"
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
            {recipe && <RecipeResultView recipe={recipe} onDownload={() => downloadRecipe(recipe)} onPin={() => pinRecipe(recipe)} />}
          </div>
        )}

        {/* Personal Tab Content */}
        {activeTab === "personal" && (
          <div className="max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-300 grid md:grid-cols-12 gap-8">
            {/* Sidebar: Saved Recipes */}
            <div className="md:col-span-3 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2">
                    <h2 className="text-2xl font-bold px-2 text-zinc-800 dark:text-zinc-200">Personal</h2>
                    <label className="cursor-pointer bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 p-2 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-zinc-600 dark:text-zinc-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                    </label>
                </div>
                {personalRecipes.length === 0 ? (
                    <div className="space-y-4 px-2">
                        <p className="text-zinc-500 text-sm italic">No personal recipes yet.</p>
                        <p className="text-zinc-400 text-xs">Pin results from Generate tab or upload a JSON file.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {personalRecipes.map((r, idx) => (
                            <div key={idx} className="group relative">
                                <button
                                    onClick={() => setSelectedPersonalIdx(idx)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-lg font-bold transition-all pr-10 ${selectedPersonalIdx === idx ? "bg-purple-600 text-white shadow-md shadow-purple-200 dark:shadow-none" : "hover:bg-purple-50 dark:hover:bg-purple-900/30 text-zinc-700 dark:text-zinc-300"}`}
                                >
                                    <div className="truncate">{r.vibe_match}</div>
                                    <div className={`text-xs mt-0.5 ${selectedPersonalIdx === idx ? "text-purple-200" : "text-zinc-400"}`}>{r.base_mode}</div>
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); removePersonalRecipe(idx); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all text-zinc-400"
                                    title="Remove from personal"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content: Recipe Detail */}
            <div className="md:col-span-9">
                {selectedPersonalIdx !== null ? (
                    <RecipeResultView 
                        recipe={personalRecipes[selectedPersonalIdx]} 
                        onDownload={() => downloadRecipe(personalRecipes[selectedPersonalIdx])} 
                        small 
                    />
                ) : (
                    <div className="h-full min-h-[500px] flex items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl bg-white/50 dark:bg-zinc-800/50">
                        <div className="text-center space-y-4 p-8">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300">Your Collection</h3>
                            <p className="text-zinc-500 max-w-xs mx-auto">Select a recipe from the sidebar to view details, or upload your own JSON recipe files.</p>
                        </div>
                    </div>
                )}
            </div>
          </div>
        )}

        {/* History Tab Content */}
        {activeTab === "history" && (
          <div className="max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-300 grid md:grid-cols-12 gap-8">
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
                                    className={`w-full text-left px-4 py-3 rounded-xl text-lg font-bold transition-all ${selectedDate === date ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none" : "hover:bg-blue-50 dark:hover:bg-blue-900/30 text-zinc-700 dark:text-zinc-300"}`}
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
                {historyRecipe ? (
                    <RecipeResultView 
                        recipe={historyRecipe} 
                        onDownload={() => downloadRecipe(historyRecipe)} 
                        onPin={() => pinRecipe(historyRecipe)}
                        small 
                    />
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

        {/* Demo Tab Content */}
        {activeTab === "demo" && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
                {!selectedDemo ? (
                    // Gallery Grid View
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {DEMO_RECIPES.map((demo) => (
                            <div 
                                key={demo.id} 
                                onClick={() => handleDemoSelect(demo)}
                                className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-zinc-200 dark:border-zinc-700"
                            >
                                {/* Placeholder Image - In real app, use next/image */}
                                <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-700">
                                    {/* We use a simple img tag for simplicity, in Next.js Image is preferred but requires width/height */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={demo.image} 
                                        alt={demo.title} 
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => {
                                            // Fallback if image not found
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                    {/* Fallback Text if image fails to load or is placeholder */}
                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-400 opacity-20 group-hover:opacity-0 transition-opacity pointer-events-none">
                                        <span className="font-bold text-4xl">?</span>
                                    </div>
                                </div>
                                
                                {/* Overlay Info */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                    <h3 className="text-white text-xl font-bold">{demo.title}</h3>
                                    <p className="text-zinc-300 text-sm">{demo.recipe.base_mode}</p>
                                    {demo.recipe.global_settings.hdf_recommendation === "ON" && (
                                        <span className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white border border-white/30">
                                            HDF ON
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Detail View
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                         {/* Left: Image & Back Button */}
                        <div className="space-y-4">
                             <button 
                                onClick={() => setSelectedDemo(null)}
                                className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                </svg>
                                Back to Gallery
                             </button>
                             <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-lg border border-zinc-200 dark:border-zinc-700">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                    src={selectedDemo.image} 
                                    alt={selectedDemo.title} 
                                    className="h-full w-full object-cover"
                                />
                             </div>
                             <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <h3 className="font-bold text-lg mb-1">{selectedDemo.title}</h3>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm">{selectedDemo.description}</p>
                             </div>
                        </div>

                        {/* Right: Recipe Details */}
                        <div>
                             <RecipeResultView 
                                recipe={selectedDemo.recipe} 
                                onDownload={() => downloadRecipe(selectedDemo.recipe)} 
                                onPin={() => pinRecipe(selectedDemo.recipe)}
                                small 
                             />
                        </div>
                    </div>
                )}
            </div>
        )}
      </main>
    </div>
  );
}

// Extracted Result View Component to reuse
function RecipeResultView({ recipe, onDownload, onPin, small = false }: { recipe: RecipeResponse, onDownload: () => void, onPin?: () => void, small?: boolean }) {
  return (
    <div className={`grid gap-8 ${small ? "md:grid-cols-1" : "md:grid-cols-2"}`}>
    {/* Left Column: Overview & Global */}
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
        <div className="flex justify-between items-start mb-2">
          <div className="uppercase tracking-wide text-sm font-bold text-blue-500">
            Result
          </div>
          <div className="flex items-center gap-2">
            {onPin && (
                <button
                    onClick={onPin}
                    className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors font-medium text-zinc-600 dark:text-zinc-300"
                    title="Pin to Personal Recipes"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                    Pin
                </button>
            )}
            <button
                onClick={onDownload}
                className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors font-medium text-zinc-600 dark:text-zinc-300"
                title="Download Recipe JSON"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                JSON
            </button>
          </div>
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
              className={`font-bold ${small ? "text-lg" : "text-xl"} ${recipe.global_settings.hdf_recommendation === "ON" ? "text-purple-500" : ""}`}
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
                className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-blue-500" : "bg-zinc-700"} ${step === 0 ? "mx-1" : ""}`}
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