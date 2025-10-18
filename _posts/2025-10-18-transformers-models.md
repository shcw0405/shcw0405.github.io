---
layout: post
title: "Transformers Models"
date: 2025-10-18 10:00:00 +0800
categories: [NLP]
tags: [Transformers, HuggingFace, NLP, 教程]
excerpt: "Hugging Face Transformers 的 pipeline 核心用法与常见任务示例（零样本分类、文本生成、填空、NER、问答、摘要、翻译等）。"
---

这是一份快速上手与常用任务速查，基于 Hugging Face Transformers。重点放在 pipeline 的统一接口与最常用的任务示例，确保复制即可运行，且能正确渲染代码块与列表。

提示：如果首次运行，会自动下载模型到本地缓存（默认在 `~/.cache/huggingface`）。

小目录
- 安装与快速开始
- 常见任务：
  - 文本分类（情感/主题）
  - 零样本分类（zero-shot）
  - 文本生成（text-generation）
  - 填空（fill-mask）
  - 实体识别（NER）
  - 抽取式问答（QA）
  - 摘要（summarization）
  - 翻译（translation）
- 批量输入与设备选择
- 直接使用 AutoTokenizer/AutoModel
- 实用技巧与排障

安装与环境

```bash
pip install --upgrade transformers accelerate torch
# 可选：如果有 GPU，安装与你 CUDA 匹配的 torch 版本
```

快速开始：统一的 pipeline

```python
from transformers import pipeline

clf = pipeline("sentiment-analysis")
print(clf("I love Transformers!"))
# [{'label': 'POSITIVE', 'score': 0.9998}]
```

常见任务示例

1) 文本分类（情感/主题）

```python
from transformers import pipeline

# 默认会选一个通用英文情感分类模型
sa = pipeline("sentiment-analysis")
print(sa(["This movie is fantastic!", "This movie is terrible..."]))

# 指定中文模型（示例：uer/roberta-base-finetuned-jd-binary-chinese）
zh_clf = pipeline(
    "text-classification",
    model="uer/roberta-base-finetuned-jd-binary-chinese",
    tokenizer="uer/roberta-base-finetuned-jd-binary-chinese"
)
print(zh_clf("这个产品体验很好！"))
```

2) 零样本分类（Zero-shot classification）

无需针对特定标签训练，直接给候选标签即可。

```python
from transformers import pipeline

zs = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
text = "I recently ordered a book from your website, and the delivery was delayed."
labels = ["product", "delivery", "customer support", "payment"]
print(zs(text, candidate_labels=labels))

# 多语言可考虑 'joeddav/xlm-roberta-large-xnli' 等模型
```

3) 文本生成（Text generation）

```python
from transformers import pipeline

# 小模型示例（英文）
gen = pipeline("text-generation", model="gpt2")
print(gen("In a distant future, humanity", max_new_tokens=40, do_sample=True, temperature=0.9))

# 中文可使用如 'THUDM/chatglm2-6b'（需 GPU 与相应依赖），或小型中文生成模型
```

4) 填空（Masked language modeling / fill-mask）

```python
from transformers import pipeline

mlm = pipeline("fill-mask", model="bert-base-uncased")
print(mlm("Transformers are <mask> for NLP."))

# 中文示例：
zh_mlm = pipeline("fill-mask", model="hfl/chinese-bert-wwm-ext")
print(zh_mlm("深度学习正在<mask>我们的工作方式。"))
```

5) 命名实体识别（NER）

```python
from transformers import pipeline

ner = pipeline("ner", grouped_entities=True)
text = "Hugging Face Inc. is a company based in New York City."
for ent in ner(text):
    print(ent)

# 中文 NER 可选模型（示例）："shibing624/bert4ner-base-chinese"
```

6) 抽取式问答（Question Answering）

```python
from transformers import pipeline

qa = pipeline("question-answering")
context = """
The Transformer architecture was introduced in the paper 'Attention Is All You Need'.
It uses self-attention and positional embeddings to model sequences in parallel.
"""
print(qa(question="Which paper introduced the Transformer?", context=context))
```

7) 摘要（Summarization）

```python
from transformers import pipeline

summ = pipeline("summarization", model="facebook/bart-large-cnn")
article = """
Large language models have achieved state-of-the-art results on various NLP tasks, 
but they often require significant compute resources. Efficient fine-tuning and 
deployment techniques have become increasingly important.
"""
print(summ(article, max_length=60, min_length=20, do_sample=False))
```

8) 翻译（Translation）

```python
from transformers import pipeline

# 英 -> 中
translator = pipeline("translation_en_to_zh", model="Helsinki-NLP/opus-mt-en-zh")
print(translator("Transformers unify APIs across dozens of tasks."))

# 通用 M2M / NLLB 模型（多语言之间互译）
# model="facebook/m2m100_418M" 或 "facebook/nllb-200-3.3B"（后者较大，需要更强算力）
```

批量输入与设备选择

- pipeline 支持批量输入：直接传入 list 即可。
- 使用 GPU：将 `device=0` 传给 pipeline；多个 GPU 时可设置不同编号。
- 在 CPU 上可以运行但速度较慢；建议开启 `torch.set_num_threads()` 或使用更小模型。

```python
from transformers import pipeline
import torch

texts = [
    "The new design is elegant and efficient.",
    "We encountered an unexpected error during deployment."
]
clf = pipeline("text-classification", device=0)  # GPU:0；CPU 则去掉 device 参数
print(clf(texts))

# 控制线程数（CPU 环境）
torch.set_num_threads(4)
```

直接使用 AutoTokenizer / AutoModel

当需要更灵活的定制时，直接加载模型与分词器。

```python
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

model_id = "distilbert-base-uncased-finetuned-sst-2-english"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSequenceClassification.from_pretrained(model_id)

inputs = tokenizer("Transformers make NLP easier.", return_tensors="pt")
with torch.no_grad():
    outputs = model(**inputs)
probs = outputs.logits.softmax(dim=-1)
print(probs)
```

实用技巧与排障

- 模型缓存：默认在 `~/.cache/huggingface`，可通过环境变量 `HF_HOME` 自定义。
- 代理与超时：在国内环境可配置镜像或代理，提高下载速度。
- 小模型优先：推理优先选小模型（如 distil/mini），先通再精。
- 批处理：尽量批量调用 pipeline，降低开销。
- reproducibility：固定 `seed`（如 `transformers.set_seed(42)`）以保证可复现的生成结果。

以上示例涵盖多数日常 NLP 任务。若你只记得一件事：先用 pipeline 跑通，再按需下钻到 AutoModel 自定义训练与推理。
