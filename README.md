# Ricoh GR Series AI Recipe Generator 📸

An AI-powered tool that translates abstract "vibes" (e.g., "Cyberpunk Tokyo Night", "Melancholy Rainy Sunday") and visual references into precise custom image settings (JPEG Recipes) for **Ricoh GR** cameras (GR III, GR IIIx, etc.).

It leverages multimodal AI models (like GPT-4o) to analyze both your text descriptions and reference images (upload multiple or paste from clipboard), mapping them to the Ricoh GR's specific color science, including **Image Control** modes, **White Balance** shifts, and **HDF (Highlight Diffusion Filter)** logic.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Python-3.11%2B-blue)
![Frontend](https://img.shields.io/badge/Frontend-Next.js-black)

## ✨ Features

- **Vibe-to-Recipe Engine**: Converts natural language prompts into camera settings.
- **Advanced Vision Support**: Upload multiple reference photos or paste images directly from your clipboard (Ctrl+V) to let the AI analyze color palettes and tonal ranges.
- **Expert Colorist AI**: Integrated professional color grading logic that deconstructs aesthetics into precise Ricoh parameters.
- **Personal Collection**: "Pin" your favorite generated recipes or upload existing JSON recipes to your local browser storage.
- **History Browsing**: Automatically logs every generated recipe by date, allowing you to browse past creations in the History tab.
- **Ricoh Specific Logic**: Tailored for Ricoh GR Image Control (Negative Film, Positive Film, etc.) and HDF optimization.
- **Recipe Export**: Download recipes as standard JSON files for sharing or backup.
- **Flexible LLM Support**: Configurable Base URL and Model Name to support various AI providers (OpenAI, Local LLMs, etc.).

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python), OpenAI SDK
- **Frontend**: Next.js (React), Tailwind CSS, LocalStorage
- **Package Manager**: `uv` (Python), `npm` (Node.js)

## 🚀 Getting Started

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- `uv` (Fast Python package installer)

### 🚀 Quick Start (All-in-One)

You can start both the backend and frontend simultaneously using the provided helper script:

```bash
# Make the script executable (only needed once)
chmod +x dev.sh

# Start the development environment
./dev.sh
```

This will launch:
- **Backend API**: http://localhost:8000
- **Frontend UI**: http://localhost:3000

### 1. Backend Setup

```bash
cd backend
uv sync
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 📖 Usage Guide

1.  **Generate**: Go to the **Generate** tab. Enter a description or **upload/paste reference images** (you can use multiple!).
2.  **Pin**: If you love a result, click the **Pin** button to save it to your **Personal** tab.
3.  **Manage**: In the **Personal** tab, you can view your pinned recipes, upload external JSON recipes, or remove ones you no longer need.
4.  **History**: Browse all past generations organized by date in the **History** tab.
5.  **Export**: Click **JSON** on any recipe card to download the file.

## 📂 Project Structure

```
gr-recipe-generator/
├── backend/            # FastAPI Server
│   └── app/            # Application logic & schemas
├── frontend/           # Next.js Web App
│   └── app/            # UI Components & State
├── result/             # Server-side history logs (JSON)
└── README.md           # This file
```

## 📝 License

This project is for educational and personal use. Enjoy shooting! 📷
