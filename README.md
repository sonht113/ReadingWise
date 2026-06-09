# ReadingWise

Bilingual reading platform for English learners. Read articles, news, and stories in English with Vietnamese translation, highlight vocabulary, and save words for review.

## Features

- **Bilingual Reading** — 3 modes: Original, Side-by-Side, Interleave
- **Import from URL** — Paste any English article link → auto-extract + AI translate
- **Annotation** — Select text → translate via OpenRouter AI → save to vocabulary
- **Vocabulary** — Tooltip on hover, drawer for full word details
- **Collections & Articles** — Organize articles by topics or exam books
- **Quiz System** — Multiple choice, True/False/NG, Fill-in-blank, Matching headings
- **Auth** — Google OAuth via Supabase, email/password
- **Dark Mode** — Theme toggle with system preference detection

## Tech Stack

| Area | Technology |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4, shadcn/ui |
| Database | PostgreSQL via Supabase + Drizzle ORM |
| Auth | Supabase Auth (Google OAuth) |
| AI Translation | OpenRouter (GPT-4o-mini) |
| State | Zustand |
| Content Extraction | Mozilla Readability + JSDOM |

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase project ([free tier](https://supabase.com))
- OpenRouter API key ([free credits](https://openrouter.ai))

### Setup

```bash
git clone https://github.com/sonht113/ReadingWise.git
cd ReadingWise
cp .env.example .env.local
```

### Environment Variables

Fill in `.env.local` with your credentials:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase publishable key |
| `DATABASE_URL` | Supabase PostgreSQL connection string (pooler) |
| `OPENROUTER_API_KEY` | Your OpenRouter API key |
| `OPENROUTER_MODEL` | Model name (default: `openai/gpt-4o-mini`) |

### Install & Run

```bash
npm install
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/              # REST API routes (articles, collections, translate, etc.)
│   ├── auth/             # Login, signup, OAuth callback pages
│   └── page.tsx          # Home
├── components/
│   ├── annotation/       # MiniToolbar, Tooltip, VocabularyDrawer
│   ├── auth/             # OAuth section
│   ├── layout/           # Sidebar, ReaderLayout, ImportDialog, ThemeToggle
│   ├── providers/        # QueryProvider, ThemeProvider
│   ├── question/         # QuestionPanel, MultipleChoice, TrueFalseNG, etc.
│   ├── reader/           # ArticleContent, AnnotationLayer, BilingualArticleContent
│   └── ui/               # shadcn/ui primitives (button, dialog, card, etc.)
├── db/                   # Drizzle ORM schema + client
├── hooks/                # Data-fetching hooks (TanStack Query)
├── lib/                  # OpenRouter client, text segmentation, Supabase
├── stores/               # Zustand stores (reader)
└── types/                # TypeScript interfaces
```

## License

MIT
