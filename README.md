# Ricoh GR Series AI Recipe Generator 📸

An AI-powered tool that translates abstract "vibes" (e.g., "Cyberpunk Tokyo Night", "Melancholy Rainy Sunday") into precise custom image settings (JPEG Recipes) for **Ricoh GR** cameras (GR III, GR IIIx, etc.).

It leverages OpenAI's GPT models to analyze the emotional intent of your description and maps it to the Ricoh GR's specific color science, including **Image Control** modes, **White Balance** shifts, and **HDF (Highlight Diffusion Filter)** logic (if applicable).

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Python-3.11%2B-blue)
![Frontend](https://img.shields.io/badge/Frontend-Next.js-black)

## ✨ Features

- **Vibe-to-Recipe Engine**: Converts natural language prompts into camera settings.
- **Ricoh Specific Logic**: tailored for Ricoh GR Image Control (Negative Film, Positive Film, etc.) and HDF optimization.
- **Modern UI**: Supports Markdown input, tab navigation, and a responsive design.
- **History Browsing**: Browse your past recipes organized by date with a dedicated display tab.
- **Recipe Export**: Download generated recipes as JSON files for backup or sharing.
- **Advanced Control**: Customizable White Balance (Daylight, Tungsten, CTE, etc.) and AB/GM shifts.
- **Smart Logging**: Automatically saves every generated recipe as a JSON file in the `result/` directory for backup.
- **Flexible LLM Support**: Configurable Base URL and Model Name to support various AI providers (OpenAI, Local LLMs, etc.).

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python), Pydantic, OpenAI SDK
- **Frontend**: Next.js (React), Tailwind CSS
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

Press `Ctrl+C` to stop both services.

### 1. Backend Setup

The backend handles the AI logic and API requests.

```bash
# Navigate to backend directory
cd backend

# Initialize environment (install dependencies)
uv sync

# Create .env file
cp .env.example .env

# Edit .env and add your OpenAI API Key
# nano .env
```

**Run the Backend Server:**

```bash
# Activate virtual environment and run
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

### 2. Frontend Setup

The frontend provides a modern web interface for generating recipes.

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The UI will be available at `http://localhost:3000`.

## 📖 Usage Guide

1.  Open your browser to `http://localhost:3000`.
2.  Enter a vibe description (e.g., *"Wes Anderson style pastel symmetry"*).
3.  Click **Generate**.
4.  View the resulting recipe card with all the settings you need to dial into your camera.
5.  **(Optional)** Use the "Advanced Settings" toggle to change the AI Model or Base URL temporarily.

## ⚙️ Configuration (.env)

You can configure global defaults in `backend/.env`:

```env
OPENAI_API_KEY=sk-...           # Required: Your API Key
OPENAI_MODEL=gpt-4o             # Optional: Default model (default: gpt-4o)
OPENAI_BASE_URL=...             # Optional: Custom API Endpoint
```

## 📂 Project Structure

```
gr-recipe-generator/
├── backend/            # FastAPI Server
│   ├── app/            # Application logic & schemas
│   ├── result/         # (Generated) JSON logs of recipes
│   └── main.py         # Entry point
├── frontend/           # Next.js Web App
│   ├── app/            # React components & pages
│   └── public/         # Static assets
├── result/             # Saved recipe logs (JSON)
└── README.md           # This file
```

## 📝 License

This project is for educational and personal use. Enjoy shooting! 📷
