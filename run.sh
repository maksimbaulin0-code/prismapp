#!/bin/bash

# Запуск сервера API
echo "Starting API server..."
npx tsx server.ts &

# Запуск dev сервера
echo "Starting Vite dev server..."
npm run dev