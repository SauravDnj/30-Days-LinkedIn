# Saurav Danej · 30 Days LinkedIn AI/ML Content

This folder contains a small HTML/CSS/JS website that renders:

- 30 daily LinkedIn posts (AI/ML, Python, RAG, DSA, AI automation, AI agents)
- Flow diagrams (Mermaid)
- Interview question bank
- A print-to-PDF view
- A PNG image generator (LinkedIn-ready templates)

## Run locally

Because the site loads JSON via `fetch`, open it with a local web server (not `file://`).

### Option A (Python)

```bash
python -m http.server 5500
```

Open `http://localhost:5500/`

### Option B (Node)

```bash
npx serve .
```

## Files

- `index.html`: Posts browser + diagram preview + copy buttons
- `pdf.html`: Printable booklet view (use browser Print → Save as PDF)
- `images.html`: Canvas-based image generator → download PNG
- `interview.html`: Interview question bank (copy all)
- `content/posts.json`: 30-day post content (edit this to customize)
- `content/interview_questions.json`: Interview Q&A bank

## Customize

Update:
- your name/links in the HTML headers/footers
- any post text in `content/posts.json` (hook/body/CTA/hashtags)

