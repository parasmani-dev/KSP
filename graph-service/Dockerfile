FROM python:3.11-slim
WORKDIR /app
COPY graph-service/requirements-runtime.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY graph-service/ ./graph-service/
COPY Dataset/ ./Dataset/
WORKDIR /app/graph-service
EXPOSE 8001
CMD ["sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-8001}"]
