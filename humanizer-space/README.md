---
title: humanizer
emoji: ✍️
colorFrom: green
colorTo: gray
sdk: docker
app_port: 7860
startup_duration_timeout: 1h
models:
  - jialinyyzz/humanizer
license: apache-2.0
short_description: Rewrite AI drafts so they read like a person wrote them
---

# humanizer demo

Gradio front end for [jialinyyzz/humanizer](https://huggingface.co/jialinyyzz/humanizer), a 12B
model (fine-tuned from `google/gemma-4-12B`) that rewrites AI-written English or Chinese drafts
while keeping every number, date, name and quote.

It follows the model's `AGENTS.md`:

- runs a GGUF file on llama.cpp's `llama-server` (official `ghcr.io/ggml-org/llama.cpp:server` image);
- sends the text-completion prompt from `prompt_format.json` byte for byte (the fingerprint is checked at startup), not a chat template;
- samples with temperature 1.0 and top-p 0.95, with top-k, min-p and repetition penalty switched off, and stops on EOS only;
- sets `n_predict` to 2.5× the draft's tokens (256–2048) and keeps one 8192-token slot;
- resamples (up to 3 times) when an English draft comes back in Chinese;
- lists any numbers that were dropped or added, so you know what to proofread.

## Hardware and model file

The model file is picked with the `MODEL_FILE` Space variable (default `humanizer-12b-Q3-QAT.gguf`):

| Hardware | `MODEL_FILE` |
|---|---|
| Free CPU basic (16 GB RAM) | `humanizer-12b-Q3-QAT.gguf` (5.6 GB) or `humanizer-12b-IQ2_XS-QAT.gguf` (3.9 GB, faster) |
| CPU upgrade (32 GB RAM) | `humanizer-12b-Q4_K_M.gguf` or `humanizer-12b-Q6_K.gguf` |

On CPU a rewrite takes minutes. For a GPU Space, change the base image to
`ghcr.io/ggml-org/llama.cpp:server-cuda` and use `humanizer-12b-Q8_0.gguf`; `-ngl 99` already puts all layers on the GPU.

The first start downloads the GGUF file (several GB) before the model can answer; the UI shows progress meanwhile.
