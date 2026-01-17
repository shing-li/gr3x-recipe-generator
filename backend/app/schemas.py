from pydantic import BaseModel, Field
from typing import Optional

class GlobalSettings(BaseModel):
    exposure_recommendation: str = Field(..., description="建議曝光值, e.g., '-0.3 EV'")
    wb_setting: str = Field(..., description="白平衡設定, e.g., '日光 (5200K)'")
    wb_shift_a: int = Field(..., description="白平衡偏移 A (Amber-Blue axis)")
    wb_shift_g: int = Field(..., description="白平衡偏移 G (Green-Magenta axis)")
    hdf_recommendation: str = Field(..., description="HDF 開關建議, 'ON' or 'OFF'")

class Parameters(BaseModel):
    saturation: int = Field(..., ge=-4, le=4, description="飽和度 (-4 to +4)")
    hue: int = Field(..., ge=-4, le=4, description="色相 (-4 to +4)")
    high_low_key: int = Field(..., ge=-4, le=4, description="影調 (-4 to +4)")
    contrast: int = Field(..., ge=-4, le=4, description="對比度 (-4 to +4)")
    contrast_highlight: int = Field(..., ge=-4, le=4, description="對比度-亮部 (-4 to +4)")
    contrast_shadow: int = Field(..., ge=-4, le=4, description="對比度-暗部 (-4 to +4)")
    sharpness: int = Field(..., ge=-4, le=4, description="銳度 (-4 to +4)")
    shading: int = Field(..., ge=-4, le=4, description="明暗/周邊失光 (-4 to +4)")
    clarity: int = Field(..., ge=-4, le=4, description="清晰 (-4 to +4)")

class RecipeResponse(BaseModel):
    vibe_match: str = Field(..., description="氛圍匹配名稱 (中文 + 英文)")
    base_mode: str = Field(..., description="基底模式 (e.g., Negative Film, Positive Film)")
    global_settings: GlobalSettings
    parameters: Parameters
    note: str = Field(..., description="AI 對於美學選擇的解釋")

class GenerateRequest(BaseModel):
    prompt: str = Field(..., description="使用者輸入的氛圍描述")
    api_key: Optional[str] = Field(None, description="OpenAI API Key (Optional if set in env)")
    base_url: Optional[str] = Field(None, description="Custom Base URL (Optional)")
    model: Optional[str] = Field(None, description="Model name (e.g., 'gpt-4o', 'gpt-3.5-turbo'). Defaults to server config.")
