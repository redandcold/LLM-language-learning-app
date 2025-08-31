@echo off
set OLLAMA_MODELS=F:\Ollama\models
echo Starting Ollama with OLLAMA_MODELS=%OLLAMA_MODELS%
echo.
echo To download models to this folder, use:
echo   set OLLAMA_MODELS=F:\Ollama\models
echo   ollama pull [model_name]
echo.
ollama serve