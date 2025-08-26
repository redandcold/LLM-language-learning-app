@echo off
set OLLAMA_MODELS=F:\language_learning_app\ollama-models
echo Starting Ollama with OLLAMA_MODELS=%OLLAMA_MODELS%
echo.
echo To download models to project folder, use:
echo   set OLLAMA_MODELS=F:\language_learning_app\ollama-models
echo   ollama pull [model_name]
echo.
ollama serve