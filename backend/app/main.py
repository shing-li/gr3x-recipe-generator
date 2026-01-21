from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from app.schemas import GenerateRequest, RecipeResponse
from app.logic.system_prompt import SYSTEM_PROMPT
from openai import OpenAI
import os
import json
import uuid
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Ricoh GR Series Recipe Generator")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. In prod, restrict to frontend domain.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure result directory exists
# Assuming backend is running from 'backend/' directory, result is in '../result'
RESULT_DIR = Path("..") / "result"
if not RESULT_DIR.exists():
    # If running from project root for some reason, try just "result"
    if Path("result").exists():
        RESULT_DIR = Path("result")
    else:
        # Default to ../result and create it if it doesn't exist
        RESULT_DIR.mkdir(parents=True, exist_ok=True)

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Ricoh GR Series Recipe Generator"}

@app.post("/api/generate", response_model=RecipeResponse)
def generate_recipe(request: GenerateRequest):
    # Determine API Key
    api_key = request.api_key or os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=401, detail="API Key not provided and not found in environment.")

    # Determine Base URL
    base_url = request.base_url or os.getenv("OPENAI_BASE_URL")

    try:
        client = OpenAI(api_key=api_key, base_url=base_url)
        
        model_name = request.model or os.getenv("OPENAI_MODEL") or "gpt-4o"

        response = client.chat.completions.create(
            model=model_name,  # Or gpt-3.5-turbo, dependent on user budget/key
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Generate a recipe for: {request.prompt}"}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
        )

        content = response.choices[0].message.content
        if not content:
            raise HTTPException(status_code=500, detail="Empty response from AI")

        # Parse JSON
        data = json.loads(content)
        recipe_response = RecipeResponse(**data)

        # Log result to JSON file
        try:
            log_entry = {
                "id": str(uuid.uuid4()),
                "timestamp": datetime.now().isoformat(),
                "user_input": request.prompt,
                "model": model_name,
                "output": data
            }
            
            # Use vibe_match for filename, sanitized
            vibe_name = data.get("vibe_match", "unknown_recipe")
            # Simple sanitization: keep alphanumeric, spaces, hyphens, underscores, dots
            safe_filename = "".join([c for c in vibe_name if c.isalnum() or c in (' ', '-', '_', '.')]).strip()
            # Replace spaces with underscores
            safe_filename = safe_filename.replace(' ', '_')
            
            # Resolve absolute path to avoid confusion
            # If we are in backend/, RESULT_DIR is ../result
            # We created RESULT_DIR globally, but let's be safe
            log_file = RESULT_DIR / f"{safe_filename}.json"
            
            # If the global path check failed or we are in a different cwd context
            # Let's ensure strict path relative to this file
            if not RESULT_DIR.exists():
                 # Fallback: relative to this file: backend/app/main.py -> backend/app/../../result -> backend/../result -> root/result
                 project_root_result = Path(__file__).parent.parent.parent / "result"
                 project_root_result.mkdir(exist_ok=True)
                 log_file = project_root_result / f"{safe_filename}.json"

            with open(log_file, "w", encoding="utf-8") as f:
                json.dump(log_entry, f, ensure_ascii=False, indent=2)
                
        except Exception as log_error:
            # Don't fail the request if logging fails, just print to stderr
            print(f"Failed to log result: {log_error}")

        # Validate against our schema
        return recipe_response

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse AI response as JSON.")
    except ValidationError as e:
        raise HTTPException(status_code=500, detail=f"AI response validation error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
