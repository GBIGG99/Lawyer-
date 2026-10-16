# llama.cpp's official CPU server image (Ubuntu 24.04, llama-server at /app/llama-server).
# The model needs llama.cpp build b11335 or newer.
FROM ghcr.io/ggml-org/llama.cpp:server

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-venv \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/venv
COPY requirements.txt /tmp/requirements.txt
RUN /opt/venv/bin/pip install --no-cache-dir -r /tmp/requirements.txt

# Spaces run the container as uid 1000; give it a writable home for the HF cache.
RUN mkdir -p /home/space/app && chmod -R 777 /home/space
ENV HOME=/home/space \
    HF_HOME=/home/space/.cache/huggingface \
    PYTHONUNBUFFERED=1 \
    GRADIO_SERVER_NAME=0.0.0.0
WORKDIR /home/space/app
COPY app.py .

EXPOSE 7860
ENTRYPOINT []
CMD ["/opt/venv/bin/python", "app.py"]
