FROM python:3.11-slim
WORKDIR /app
COPY ai-services/requirements-runtime.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY ai-services/ ./ai-services/
COPY Dataset/ ./Dataset/
WORKDIR /app/ai-services
EXPOSE 8000
CMD ["sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
