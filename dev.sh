#!/bin/bash

# 定義清理函數，在腳本結束時殺死所有子進程
cleanup() {
    echo -e "\n🛑 正停止所有服務..."
    kill $(jobs -p) 2>/dev/null
    wait
    echo "✅ 所有服務已停止"
}

# 捕捉 SIGINT (Ctrl+C) 和 SIGTERM 信號
trap cleanup SIGINT SIGTERM

echo "🚀 正在啟動開發環境..."

# 啟動後端
echo "🐍 正在啟動後端 (FastAPI)..."
cd backend
# 使用 uv 執行 uvicorn，啟用熱重載
uv run uvicorn app.main:app --reload --port 8000 & 
BACKEND_PID=$!
cd ..

# 等待一下確保後端開始啟動
sleep 2

# 啟動前端
echo "⚛️  正在啟動前端 (Next.js)..."
cd frontend
npm run dev & 
FRONTEND_PID=$!
cd ..

echo "✨ 服務已啟動！"
echo "   - 前端: http://localhost:3000"
echo "   - 後端: http://localhost:8000"
echo "   (按 Ctrl+C 停止)"

# 等待所有後台進程
wait
