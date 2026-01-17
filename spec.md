# Ricoh GR IIIx AI Recipe Generator: Project Specification

## 1. 專案概述 (Project Overview)
這是一個結合攝影美學與人工智慧的 Side Project，旨在利用 LLM 將感性的氛圍描述轉化為 Ricoh GR IIIx HDF 的精確影像控制參數。專案採用 **Vibe Coding** 模式開發，強調快速原型實作與極簡的技術架構。

---

## 2. 開發目標 (Development Goals)
* **美學轉譯：** 精準將自然語言（如「90年代港片」、「午後陽光」）映射為相機物理參數。
* **HDF 邏輯優化：** 針對物理高光擴散濾鏡進行數位參數補償（如 Clarity 與 Highlight Contrast）。
* **資安與隱私：** 支援動態注入使用者自定義 API Key，確保不硬編碼敏感資訊。
* **自架友好：** 以 Docker 容器化為目標，適配 Raspberry Pi 5 部署環境。

---

## 3. 功能需求 (Functional Requirements)
- **描述輸入：** 提供 Web 介面輸入氛圍描述。
- **完整參數輸出：** 產出包含 HDF 開關、曝光補償、WB 以及 10 項影像微調參數。
- **LLM 美學解釋：** AI 需解釋為何選擇該基底濾鏡，以及各項關鍵參數如何達成該氛圍。
- **配置管理：** 提供介面讓使用者隨時更換指定的 API Key (OpenAI 或相機相容之本地 LLM)。
- **Cyberpunk UI：** (低優先級) 提供以螢光綠、黑背景、等寬字體為主的賽博龐克風格介面。

---

## 4. 技術規格 (Technical Specifications)

### 開發工具與套件管理
* **管理工具：** `uv` (Python Package Manager)
* **後端：** FastAPI
* **前端：** Next.js (Tailwind CSS) 或 Streamlit (快速原型)
* **AI 整合：** OpenAI SDK (支援自定義 Base URL 以對接本地模型)

### 預期輸出架構 (JSON Schema)
```json
{
  "vibe_match": "午後慵懶咖啡廳 (Lazy Afternoon Cafe)",
  "base_mode": "Negative Film",
  "global_settings": {
    "exposure_recommendation": "-0.3 EV",
    "wb_setting": "日光 (5200K)",
    "wb_shift": {
      "A": 2,
      "G": 1
    },
    "hdf_recommendation": "ON"
  },
  "parameters": {
    "saturation": 1,
    "hue": 1,
    "high_low_key": 1,
    "contrast": -1,
    "contrast_highlight": -2,
    "contrast_shadow": 2,
    "sharpness": -1,
    "shading": -1,
    "clarity": -1
  },
  "note": "適合陽光灑落的窗邊，利用 HDF 強化高光溢出感。"
}