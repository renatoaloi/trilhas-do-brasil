FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /storage

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=10s --start-period=20s --retries=5 \
  CMD python -c "import urllib.request, sys; urllib.request.urlopen('http://127.0.0.1:8000/health'); sys.exit(0)" || exit 1

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
