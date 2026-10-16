"""Gradio demo for jialinyyzz/humanizer, served by llama.cpp's llama-server.

Follows the model's AGENTS.md: text completion (not chat), the prompt from
prompt_format.json byte for byte, temperature 1.0 / top_p 0.95 with every
other sampler switched off, stop on EOS only, 8192-token context.
"""

import hashlib
import json
import os
import re
import subprocess
import threading
import time
import urllib.error
import urllib.request

import gradio as gr
from huggingface_hub import hf_hub_download

MODEL_REPO = os.environ.get("MODEL_REPO", "jialinyyzz/humanizer")
MODEL_FILE = os.environ.get("MODEL_FILE", "humanizer-12b-Q3-QAT.gguf")
LLAMA_SERVER = os.environ.get("LLAMA_SERVER", "/app/llama-server")
LLAMA_PORT = int(os.environ.get("LLAMA_PORT", "8080"))
LLAMA_URL = f"http://127.0.0.1:{LLAMA_PORT}"
CTX = 8192
MAX_DRAFT_TOKENS = 2200  # draft + ~2.5x rewrite + instruction must fit in CTX
MAX_ATTEMPTS = 3  # language-check resamples, as in AGENTS.md

PF = json.load(open(hf_hub_download(MODEL_REPO, "prompt_format.json"), encoding="utf-8"))


def build_prompt(draft: str) -> str:
    return PF["instr"] + "\n\n" + draft.strip() + PF["sep"]


assert hashlib.sha256(build_prompt("X").encode("utf-8")).hexdigest()[:16] == PF["fingerprint"] == "cc51d66b4c593fbe"

# ---------------------------------------------------------------- server

_state = {"status": "starting", "error": None}


def _start_server():
    try:
        _state["status"] = f"downloading {MODEL_FILE}"
        path = hf_hub_download(MODEL_REPO, MODEL_FILE)
        _state["status"] = "loading model"
        subprocess.Popen([
            LLAMA_SERVER, "-m", path, "-c", str(CTX), "-np", "1", "-ngl", "99",
            "-t", str(os.cpu_count() or 2), "--host", "127.0.0.1", "--port", str(LLAMA_PORT),
        ])
        while True:
            try:
                with urllib.request.urlopen(LLAMA_URL + "/health", timeout=5) as r:
                    if json.load(r).get("status") == "ok":
                        _state["status"] = "ready"
                        return
            except (urllib.error.URLError, OSError, ValueError):
                pass
            time.sleep(2)
    except Exception as e:  # surfaced in the UI
        _state["status"], _state["error"] = "error", repr(e)


threading.Thread(target=_start_server, daemon=True).start()


def _post(endpoint: str, body: dict):
    req = urllib.request.Request(LLAMA_URL + endpoint, json.dumps(body).encode("utf-8"),
                                 {"Content-Type": "application/json"})
    return urllib.request.urlopen(req, timeout=1800)


# ---------------------------------------------------------------- checks

CJK = re.compile(r"[一-鿿]")
NUM = re.compile(r"\d+(?:[.,]\d+)*")


def wrong_language(draft: str, out: str) -> bool:
    """English draft, rewrite with more than a few Chinese characters."""
    return len(CJK.findall(draft)) <= 3 and len(CJK.findall(out)) > 5


def numbers(text: str) -> set:
    return {n.replace(",", "") for n in NUM.findall(text)}


def check_note(draft: str, out: str) -> str:
    missing = sorted(numbers(draft) - numbers(out))
    added = sorted(numbers(out) - numbers(draft))
    lines = []
    if missing:
        lines.append("**Numbers in the draft not found in the rewrite:** " + ", ".join(missing))
    if added:
        lines.append("**Numbers in the rewrite not in the draft:** " + ", ".join(added))
    if not lines:
        lines.append("Every number in the draft appears in the rewrite.")
    lines.append("Proofread numbers, dates, names and the direction of each claim before you use it. "
                 "Sampling is random: press **Rewrite** again for another version.")
    return "\n\n".join(lines)


# ---------------------------------------------------------------- inference

def humanize(draft: str):
    draft = (draft or "").strip()
    if not draft:
        yield "", "Paste a draft first."
        return
    while _state["status"] != "ready":
        if _state["status"] == "error":
            raise gr.Error(f"Model server failed to start: {_state['error']}")
        yield "", f"⏳ Model is {_state['status']}… (first start downloads several GB)"
        time.sleep(3)

    with _post("/tokenize", {"content": draft}) as r:
        n_draft = len(json.load(r)["tokens"])
    if n_draft > MAX_DRAFT_TOKENS:
        raise gr.Error(f"Draft is {n_draft} tokens; the limit here is {MAX_DRAFT_TOKENS}. "
                       "Split it at paragraph breaks and rewrite each part.")
    n_predict = max(256, min(2048, int(n_draft * 2.5)))

    body = {"prompt": build_prompt(draft), "temperature": 1.0, "top_p": 0.95, "top_k": 0,
            "min_p": 0, "repeat_penalty": 1.0, "n_predict": n_predict, "stream": True}
    out = ""
    for attempt in range(1, MAX_ATTEMPTS + 1):
        out = ""
        status = "✍️ Rewriting…" if attempt == 1 else f"✍️ Rewrite came back in Chinese; resampling ({attempt}/{MAX_ATTEMPTS})…"
        with _post("/completion", body) as r:
            for raw in r:
                line = raw.decode("utf-8").strip()
                if not line.startswith("data: "):
                    continue
                chunk = json.loads(line[6:])
                out += chunk.get("content", "")
                yield out.strip(), status
                if chunk.get("stop"):
                    break
        if not wrong_language(draft, out):
            break
    yield out.strip(), check_note(draft, out)


# ---------------------------------------------------------------- UI

EXAMPLES = [
    """Hi Nadia,

I’m handing off the Meridian Bank loan audit to you. We’ve completed the review of 88 files, with 12 files remaining. The outstanding files are in the “Pending Review” folder in the Meridian Bank audit workspace, organized by borrower name.

The remaining items are primarily commercial real estate loans and include several files requiring confirmation of updated income statements, collateral valuations, and covenant documentation. I’ve flagged the missing items in the audit tracker and added notes for the files that may need follow-up with Meridian Bank’s loan operations team.

The deadline is Friday, March 14. Please prioritize the files marked “High” in the tracker, especially MB-2047, MB-2091, and MB-2110, since those are scheduled for management review first. I’ll be available through Wednesday afternoon to answer questions or provide context on any earlier decisions.

Thanks for taking this over.""",
    """In today's fast-paced world, remote work has become an increasingly important topic for organizations of all sizes. It is worth noting that a 2023 survey of 1,200 managers found that 64% believe hybrid schedules improve retention. Furthermore, companies that adopted a three-day office policy reported an 18% reduction in turnover over 12 months. Ultimately, it is clear that flexibility plays a crucial role in shaping the future of work.""",
    """各位同事好：

随着业务的不断发展，团队协作的重要性日益凸显。经过综合评估，我们决定自11月1日起启用新的项目管理系统。届时，所有项目需在系统中登记，预计迁移工作将在两周内完成。请各部门负责人于10月25日前提交本部门的项目清单。如有任何疑问，欢迎随时与行政部王敏联系。

感谢大家的支持与配合！""",
]

with gr.Blocks(title="humanizer") as demo:
    gr.Markdown(
        "# humanizer\n"
        "Rewrites an AI-written draft (English or Chinese) so it reads like a person wrote it, "
        "keeping every number, date, name and quote. Model: "
        f"[{MODEL_REPO}](https://huggingface.co/{MODEL_REPO}) · file `{MODEL_FILE}` on llama.cpp.\n\n"
        "One draft per request, up to about 1,500 words. On free CPU hardware a rewrite takes a few minutes."
    )
    with gr.Row():
        draft = gr.Textbox(label="Draft", lines=16, placeholder="Paste an AI-written draft…")
        rewrite = gr.Textbox(label="Rewrite", lines=16, buttons=["copy"], interactive=False)
    btn = gr.Button("Rewrite", variant="primary")
    note = gr.Markdown()
    gr.Examples(EXAMPLES, inputs=draft)
    btn.click(humanize, draft, [rewrite, note], concurrency_limit=1)

if __name__ == "__main__":
    demo.queue(max_size=20).launch(server_name="0.0.0.0", server_port=7860)
