# Ricoh GR IIIx AI Recipe Generator - 開發任務清單 (To-Do List)

## 🏗️ 第一階段：環境初始化與基礎建設 (Setup & Foundation)
- [x] **uv 環境初始化**
    - [x] 執行 `uv init` 建立專案。
    - [x] 執行 `uv add fastapi uvicorn openai pydantic-settings python-multipart` 安裝核心依賴。
- [x] **專案結構配置**
    - [x] 建立 `app/` 目錄，內含 `main.py` (API 進入點)。
    - [x] 建立 `app/logic/` 目錄，存放 `system_prompt.py`。
    - [ ] 建立 `.env.example` 範本文件（不含真實 API Key）。

## 🧠 第二階段：核心 AI 邏輯開發 (Core Logic & AI)
- [x] **System Prompt 指令集調校**
    - [x] 整合「影像控制參數邏輯表」至提示詞。
    - [x] 實作「HDF 聯動邏輯」：確保 AI 懂得根據高光需求建議 HDF 開關。
    - [x] 實作「強制 JSON 輸出」：定義 Pydantic 模型確保格式正確。
- [x] **API Key 動態注入機制**
    - [x] 撰寫封裝類別，支援從請求標頭 (Header) 或 Body 接收 API Key。
    - [x] 實作錯誤處理機制（當 Key 無效或額度不足時的報錯）。
- [x] **參數校驗器**
    - [x] 確保輸出數值嚴格限制在 Ricoh 官方的 `-4` 到 `+4` 區間。

## 🎨 第三階段：網頁介面開發 (Web Interface)
- [x] **前端基礎架構**
    - [x] 選擇框架（Next.js）。
    - [x] 實作 API Key 與 描述輸入框。
- [ ] **Cyberpunk 視覺風格實作**
    - [ ] 配置 Tailwind CSS 主題：背景 `#000000`，文字 `#00FF41` (Matrix Green)。
    - [ ] 使用等寬字體 (Monospace) 提升開發者美感。
    - [ ] 增加螢光邊框與掃描線 (Scanline) 動效（低優先級）。
- [x] **結果展示卡片**
    - [x] 視覺化 JSON 數據：左側顯示參數清單，右側顯示 AI 的美學解釋。

## 🛡️ 第四階段：資安、部署與自架整合 (Security & Deployment)
- [ ] **Docker 容器化**
    - [ ] 撰寫 `Dockerfile` (使用多階段構建優化體積)。
    - [ ] 撰寫 `docker-compose.yml`，預留本地 LLM (如 Ollama) 的串接路徑。
- [ ] **Raspberry Pi 5 適配**
    - [ ] 測試在 ARM64 環境下的運行效能。
    - [ ] 整合 Tailscale 存取權限檢查。
- [ ] **隱私審核**
    - [ ] 確認伺服器端不留存使用者的 API Key 紀錄。

---
## 🚀 未來擴充 (Backlog)
- [ ] **相簿整合：** 串接 Immich API，根據照片自動分析適合的配方。
- [ ] **配方分享：** 一鍵產出精美的 Markdown 配方卡片圖片。