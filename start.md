# start.md
# Prompt dla AI: Wygeneruj projekt "Autonomiczne Biuro" – gotowy do uruchomienia

## INSTRUKCJA DLA AI

Jesteś senior full-stack developerem. Twoim zadaniem jest wygenerowanie
KOMPLETNEGO projektu "Autonomiczne Biuro" gotowego do uruchomienia jedną komendą:
```bash
cp .env.example .env && docker compose up --build
```

Generuj pliki PO KOLEI, każdy w osobnym bloku kodu z pełną ścieżką.
Nie pomijaj żadnego pliku. Nie skracaj kodu komentarzem "reszta bez zmian".
Po każdym pliku napisz: "✅ [nazwa pliku] gotowy – kontynuuję."

---

## STACK TECHNOLOGICZNY

| Warstwa   | Technologia                                      |
|-----------|--------------------------------------------------|
| Backend   | Node.js 20, Express, better-sqlite3, ESM modules |
| Frontend  | React 18, Vite 5, CSS custom properties          |
| Baza      | SQLite (plik office.db w named Docker volume)    |
| Dev env   | Docker Compose, nodemon, Vite HMR               |
| Testy     | Vitest + Supertest                               |
| CI        | GitHub Actions                                   |

---

## STRUKTURA PLIKÓW – wygeneruj WSZYSTKIE
```
autonomous-office/
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── .dockerignore
├── .env.example
├── .gitignore
│
├── backend/
│   ├── .dockerignore
│   ├── package.json
│   ├── server.js
│   ├── db.js
│   └── test/
│       ├── helpers.js
│       ├── api.test.js
│       └── rateLimits.test.js
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html                          ← Vite wymaga w root frontend/
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── styles/
│       │   ├── tokens.css
│       │   └── globals.css
│       ├── hooks/
│       │   ├── useHotkeys.js
│       │   └── useTheme.js
│       └── components/
│           ├── ui/
│           │   ├── Button.jsx
│           │   ├── Card.jsx
│           │   └── ThemeToggle.jsx
│           ├── AgentCard.jsx
│           ├── AddAgentModal.jsx
│           ├── AuditLog.jsx
│           ├── ApprovalsPanel.jsx
│           ├── ApprovalRules.jsx
│           ├── AIResponseCard.jsx
│           ├── ContinueTaskModal.jsx
│           ├── CommandPalette.jsx
│           ├── CompanySelector.jsx
│           ├── CostDashboard.jsx
│           ├── CopyButton.jsx
│           ├── DemoToggle.jsx
│           ├── DependencyGraph.jsx
│           ├── ExportPanel.jsx
│           ├── HotkeyCheatSheet.jsx
│           ├── OnboardingWizard.jsx
│           ├── PromptVersionManager.jsx
│           ├── RateLimitPanel.jsx
│           ├── StatusDashboard.jsx
│           ├── TaskList.jsx
│           ├── TaskQueuePanel.jsx
│           ├── TemplateLoader.jsx
│           └── UndoToast.jsx
│
├── .github/
│   └── workflows/
│       └── docker-build.yml
│
└── README_DOCKER.md
```

---

## KRYTYCZNE ZASADY – bez nich projekt nie wystartuje

### 1. Ścieżka bazy SQLite (OBOWIĄZKOWE)

W `backend/db.js` baza MUSI być w katalogu z `DB_DIR`:
```js
import Database  from 'better-sqlite3';
import { join }  from 'path';
import { mkdirSync } from 'fs';

const DATA_DIR = process.env.DB_DIR || join(process.cwd(), 'data');
mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(join(DATA_DIR, 'office.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');
```

NIE pisz `new Database('office.db')` – dane zginą przy restarcie kontenera.

### 2. ESM + __dirname w vite.config.js (OBOWIĄZKOWE)
```js
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
```

### 3. env_file w docker-compose.yml – kompatybilna składnia
```yaml
# POPRAWNIE (działa na wszystkich wersjach Compose):
env_file:
  - .env

# ŹLE (wymaga Compose 2.24+, łamie starsze instalacje):
# env_file:
#   - path: .env
#     required: false
```

### 4. index.html – Vite wymaga w katalogu frontend/ (nie w public/)
```
frontend/
├── index.html       ← TU (root projektu Vite)
└── public/
    └── favicon.svg  ← statyczne assety
```

### 5. package.json – oba muszą mieć type: module
```json
{ "type": "module" }
```

---

## BACKEND – backend/package.json
```json
{
  "name": "biuro-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev":          "nodemon --watch . --ignore node_modules --ignore data --ext js,mjs,json --delay 500 server.js",
    "start":        "node server.js",
    "test":         "node --experimental-vm-modules node_modules/.bin/vitest run",
    "test:watch":   "vitest"
  },
  "dependencies": {
    "better-sqlite3": "^9.4.3",
    "cors":           "^2.8.5",
    "express":        "^4.18.3"
  },
  "devDependencies": {
    "nodemon":   "^3.1.0",
    "supertest": "^7.0.0",
    "vitest":    "^1.6.0"
  }
}
```

---

## FRONTEND – frontend/package.json
```json
{
  "name": "biuro-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev":     "vite",
    "build":   "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react":     "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite":                 "^5.3.4"
  }
}
```

---

## BACKEND – server.js (pełna architektura)

Serwer musi zawierać WSZYSTKIE poniższe elementy:

### Schemat bazy danych (db.js)

Tabele do stworzenia przez `db.exec(...)`:
```sql
companies          (id, name, mission, monthly_budget_limit, created_at)
agents             (id, company_id, name, role, model, endpoint, api_key,
                    budget, initial_budget, status, active, parent_id,
                    last_heartbeat, active_prompt_version_id, created_at)
goals              (id, company_id, title, description, created_at)
tasks              (id, company_id, agent_id, goal_id, description,
                    status, priority, scheduled_for,
                    requires_approval, approved, approval_reason,
                    delegate_to_agent_id, delegated_from_agent_id,
                    delegate_reason, parent_task_id,
                    retry_count, max_retries, last_error,
                    archived_at, blocked_reason, created_at)
audit_log          (id, company_id, agent_id, agent_name, action, detail, ts)
tools              (id, name, limit_per_hour, schema, created_at)
agent_tools        (id, agent_id, tool_id, uses_this_hour, hour_bucket,
                    UNIQUE(agent_id, tool_id))
templates          (id, name, description, payload, created_at)
responses          (id, task_id, agent_id, prompt, response, model,
                    tokens_in, tokens_out, cost, conversation,
                    parent_response_id, prompt_version_id, created_at)
company_approval_rules (id, company_id, condition_type, threshold_value,
                        requires_approval, label, enabled, created_at)
daily_cost_snapshots   (id, company_id, agent_id, date,
                        total_cost, call_count, UNIQUE(company_id,agent_id,date))
budget_alert_log       (id, company_id, alert_type, threshold_pct,
                        current_cost, budget_limit, detail,
                        fired_at, acknowledged)
prompt_versions        (id, agent_id, company_id, version, label,
                        system_prompt, notes, is_active, created_by,
                        created_at, UNIQUE(agent_id, version))
prompt_templates       (id, name, role_hint, description,
                        system_prompt, variables, created_at)
agent_rate_limits      (id, agent_id UNIQUE, daily_budget, monthly_budget,
                        max_llm_calls_per_hour, max_llm_calls_per_day,
                        max_tokens_per_call, cooldown_seconds,
                        last_llm_call_at, calls_this_hour, calls_today,
                        cost_today, cost_this_month,
                        hour_bucket, day_bucket, month_bucket,
                        on_limit_action, updated_at)
```

### Seed danych startowych

- Firma id=1: "Moja Firma", monthly_budget_limit=5.00
- 11 narzędzi z pełnym OpenAI-style JSON schema:
  `web_search, calculate, get_current_time, send_email, bash,
   analytics, api_call, slack_message, file_read, file_write, jira_create`
- 3 szablony firm: "SaaS Startup", "Marketing Agency", "Support Team"
- Reguły aprobaty dla firmy 1 (9 reguł)
- 5 szablonów promptów

### Endpointy API (wszystkie wymagane)
```
GET    /api/health
GET    /api/audit

GET    /api/companies
POST   /api/companies
PATCH  /api/companies/:id
DELETE /api/companies/:id
GET    /api/companies/:id/costs
GET    /api/companies/:id/budget_alerts
PATCH  /api/companies/:id/budget-limit
GET    /api/companies/:id/approval-rules
POST   /api/companies/:id/approval-rules
POST   /api/companies/:id/approval-rules/seed
GET    /api/companies/:id/queue
GET    /api/companies/:id/queue/stats
GET    /api/companies/:id/feedback-stats
GET    /api/companies/:id/rate-limits
GET    /api/companies/:id/graph
GET    /api/companies/:id/export/audit
GET    /api/companies/:id/export/costs
GET    /api/companies/:id/export/tasks
GET    /api/companies/:id/export/report

GET    /api/templates
POST   /api/templates/:id/apply

GET    /api/agents
POST   /api/agents
DELETE /api/agents/:id
PATCH  /api/agents/:id/budget
PATCH  /api/agents/:id/active
PATCH  /api/agents/:id/parent
GET    /api/agents/:id/responses
GET    /api/agents/:id/tools
POST   /api/agents/:id/tools
DELETE /api/agents/:id/tools/:tool_id
GET    /api/agents/:id/tasks
GET    /api/agents/:id/queue
GET    /api/agents/:id/rate-limits
PUT    /api/agents/:id/rate-limits
DELETE /api/agents/:id/rate-limits
POST   /api/agents/:id/rate-limits/reset-counters
GET    /api/agents/:id/prompt-versions
POST   /api/agents/:id/prompt-versions
POST   /api/agents/:id/prompt-versions/from-template
GET    /api/agents/:id/prompt-versions/diff
GET    /api/agents/:id/prompt-versions/stats
GET    /api/agents/:id/ab-tests
POST   /api/agents/:id/ab-tests

GET    /api/goals
POST   /api/goals
DELETE /api/goals/:id

GET    /api/tools
POST   /api/tools

GET    /api/tasks/:agent_id
GET    /api/tasks/pending/approvals
POST   /api/tasks
PATCH  /api/tasks/:id/approve
PATCH  /api/tasks/:id/reject
PATCH  /api/tasks/:id/done
PATCH  /api/tasks/:id/priority
PATCH  /api/tasks/:id/schedule
PATCH  /api/tasks/:id/archive
PATCH  /api/tasks/:id/unarchive
POST   /api/tasks/:id/delegate
GET    /api/tasks/:id/feedback-chain
GET    /api/tasks/:id/continuation-chain
GET    /api/tasks/:id/subgraph

POST   /api/heartbeat

GET    /api/responses/:id/children
POST   /api/responses/:id/continue

PATCH  /api/approval-rules/:id
DELETE /api/approval-rules/:id
GET    /api/prompt-templates
POST   /api/prompt-templates
DELETE /api/prompt-templates/:id
PATCH  /api/prompt-versions/:id
PATCH  /api/prompt-versions/:id/activate
DELETE /api/prompt-versions/:id
PATCH  /api/ab-tests/:id/end
```

### Logika heartbeat (setInterval co 30s)
```
runHeartbeat(agent_id):
  1. Pobierz agenta z bazy
  2. Jeśli !active → return sleeping
  3. Sprawdź rate limits (checkAndConsumeRateLimit)
  4. Pobierz następne zadanie (ORDER BY priority ASC, created_at ASC)
     - pomiń scheduled_for > now
     - pomiń archived
  5. Sprawdź approval rules (pre-LLM check)
  6. Jeśli jest API key → callLLMWithTools()
     - OpenAI:    model startsWith 'gpt'
     - Anthropic: model startsWith 'claude'
     - Gemini:    model startsWith 'gemini'
     - Custom:    model === 'custom'
  7. Post-LLM check approval rules
  8. Wykryj delegację (@mentions, frazy pl/en)
  9. Wykryj feedback loop mentions → createFeedbackTask()
  10. Zapisz response z prompt_version_id
  11. Odejmij koszt z budżetu agenta
  12. Zaktualizuj status agenta
  13. Sprawdź budget alerts
```

### Tool handlers (symulacje)

Wszystkie 11 narzędzi musi mieć handlery:
- `web_search` → DuckDuckGo Instant Answer API
- `calculate`  → new Function sandbox
- `get_current_time` → Date formatting
- `send_email`, `slack_message`, `jira_create` → symulacja (console.log)
- `bash` → whitelist: echo, date, ls, cat, pwd, wc, head, tail
- `analytics` → mock dane (MRR, churn, CAC itp.)
- `api_call` → fetch (tylko https://)
- `file_read`, `file_write` → symulacja

---

## FRONTEND – App.jsx (główna struktura)
```jsx
// Zakładki nawigacji:
// agents | goals | approvals | status | finance | graph | export | log

// Komponenty do użycia:
// AgentCard, AddAgentModal, AuditLog, ApprovalsPanel, ApprovalRules,
// CompanySelector, TemplateLoader, DemoToggle, StatusDashboard,
// CostDashboard, DependencyGraph, ExportPanel, OnboardingWizard,
// CommandPalette, HotkeyCheatSheet, UndoToast, ThemeToggle

// Stan globalny:
// companyId, companyName, agents, goals, activeTab
// showModal, showOnboarding, showPalette, showCheatSheet
// pendingCount, budgetAlerts

// Hotkeys (useHotkeys):
// Cmd/Ctrl+K → Command Palette
// ? → Cheat Sheet
// Esc → zamknij wszystko
// 1-5 → zakładki
// g → graf, l → log, n → nowe zadanie, a → nowy agent
// d → toggle theme, r → refresh

// Demo mode:
// Szablon "SaaS Startup" → 4 agenci + cele + zadania
// setInterval co 8s → heartbeat + losowe zadanie
```

---

## DESIGN SYSTEM

### tokens.css – CSS custom properties
```css
:root {
  /* Kolory brand */
  --color-accent:         #00e5a0;
  --color-accent-hover:   #00ffb3;
  --color-accent-dim:     rgba(0,229,160,0.12);
  --color-accent-border:  rgba(0,229,160,0.30);
  --color-accent-glow:    rgba(0,229,160,0.20);

  /* Semantyczne */
  --color-danger:  #ff6b35;
  --color-warning: #f5c842;
  --color-info:    #4499ff;
  --color-purple:  #c07fe0;
  --color-orange:  #fd7c3a;

  /* Powierzchnie – light mode */
  --color-bg:       #f0f4f8;
  --color-surface:  #ffffff;
  --color-surface-2:#f7fafc;
  --color-surface-3:#edf2f7;

  /* Tekst – light mode */
  --color-text:         #1a202c;
  --color-text-2:       #4a5568;
  --color-text-muted:   #718096;
  --color-text-inverse: #ffffff;

  /* Obramowania */
  --color-border:  rgba(0,0,0,0.10);
  --color-border-2:rgba(0,0,0,0.16);

  /* Fonty */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Spacing (4px base) */
  --space-1: 0.25rem;  --space-2: 0.5rem;
  --space-3: 0.75rem;  --space-4: 1rem;
  --space-5: 1.25rem;  --space-6: 1.5rem;
  --space-8: 2rem;     --space-10:2.5rem;

  /* Border radius */
  --radius-sm: 0.3125rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.06);
  --shadow-sm: 0 1px 4px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.10);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);

  /* Transitions */
  --transition-fast:   120ms cubic-bezier(0.16,1,0.3,1);
  --transition-normal: 200ms cubic-bezier(0.16,1,0.3,1);
  --transition-spring: 200ms cubic-bezier(0.34,1.56,0.64,1);

  /* Z-index */
  --z-modal:   500;
  --z-toast:   700;
  --z-tooltip: 900;

  /* Buttons */
  --btn-height-sm: 1.75rem;
  --btn-height-md: 2.125rem;
  --btn-height-lg: 2.5rem;
  --input-height:  2.125rem;
}

/* Dark mode */
[data-theme="dark"] {
  --color-bg:       #0d0f14;
  --color-surface:  #141820;
  --color-surface-2:#1a2030;
  --color-surface-3:#202838;
  --color-text:     #e2e8f0;
  --color-text-2:   #94a3b8;
  --color-text-muted:#64748b;
  --color-border:   rgba(255,255,255,0.08);
  --color-border-2: rgba(255,255,255,0.13);
  --shadow-sm: 0 1px 4px rgba(0,0,0,0.4);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.5);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.6);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg:       #0d0f14;
    --color-surface:  #141820;
    --color-surface-2:#1a2030;
    --color-surface-3:#202838;
    --color-text:     #e2e8f0;
    --color-text-2:   #94a3b8;
    --color-text-muted:#64748b;
    --color-border:   rgba(255,255,255,0.08);
    --color-border-2: rgba(255,255,255,0.13);
  }
}
```

---

## DOCKER – konfiguracja (gotowa, nie zmieniaj)

### docker-compose.yml – kluczowe punkty
```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: ../Dockerfile.backend
      target: dev
    environment:
      DB_DIR: /app/data          # baza w named volume
    volumes:
      - ./backend:/app:cached    # hot-reload
      - backend-nm:/app/node_modules
      - sqlite-data:/app/data    # trwała baza
    healthcheck:
      test: ["CMD","node","-e","require('http').get('http://localhost:3001/api/health',r=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"]
      interval: 10s
      retries: 6
      start_period: 25s

  frontend:
    build:
      context: ./frontend
      dockerfile: ../Dockerfile.frontend
      target: dev
    ports:
      - "5173:5173"
      - "24678:24678"            # HMR WebSocket
    environment:
      VITE_API_URL: http://backend:3001
      VITE_HMR_HOST: localhost
      VITE_HMR_PORT: "24678"
    depends_on:
      backend:
        condition: service_healthy

volumes:
  sqlite-data:
    name: biuro_sqlite-data
  backend-nm:
    name: biuro_backend-nm
  frontend-nm:
    name: biuro_frontend-nm
```

### Dockerfile.backend – stage dev
```dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache python3 make g++ sqlite tzdata
ENV TZ=Europe/Warsaw
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --build-from-source

FROM base AS dev
RUN npm install -g nodemon@3
RUN mkdir -p /app/data
EXPOSE 3001
CMD ["nodemon","--watch",".","--ignore","node_modules","--ignore","data","--ext","js,mjs,json","--delay","500","server.js"]
```

### Dockerfile.frontend – stage dev
```dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache tzdata
ENV TZ=Europe/Warsaw
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS dev
EXPOSE 5173 24678
CMD ["npm","run","dev","--","--host","0.0.0.0","--port","5173"]
```

---

## ŚRODOWISKO – .env.example (skopiuj do .env)
```bash
TZ=Europe/Warsaw
NODE_ENV=development
PORT=3001
DB_DIR=/app/data

# Klucze API (opcjonalne – bez nich tryb symulacji)
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_API_KEY=
GROQ_API_KEY=

# Frontend
VITE_API_URL=http://localhost:3001
VITE_HMR_HOST=localhost
VITE_HMR_PORT=24678
VITE_DEFAULT_THEME=dark
```

---

## KOLEJNOŚĆ GENEROWANIA PLIKÓW

Generuj w tej kolejności (każdy pełny, bez skrótów):
```
1.  .gitignore
2.  .env.example
3.  .dockerignore
4.  docker-compose.yml
5.  Dockerfile.backend
6.  Dockerfile.frontend
7.  backend/.dockerignore
8.  backend/package.json
9.  backend/db.js
10. backend/server.js
11. frontend/package.json
12. frontend/index.html
13. frontend/vite.config.js
14. frontend/src/main.jsx
15. frontend/src/App.jsx
16. frontend/src/styles/tokens.css
17. frontend/src/styles/globals.css
18. frontend/src/hooks/useTheme.js
19. frontend/src/hooks/useHotkeys.js
20. frontend/src/components/ui/Button.jsx
21. frontend/src/components/ui/Card.jsx
22. frontend/src/components/ui/ThemeToggle.jsx
23. frontend/src/components/AgentCard.jsx
24. frontend/src/components/AddAgentModal.jsx
25. frontend/src/components/AuditLog.jsx
26. frontend/src/components/ApprovalsPanel.jsx
27. frontend/src/components/ApprovalRules.jsx
28. frontend/src/components/AIResponseCard.jsx
29. frontend/src/components/ContinueTaskModal.jsx
30. frontend/src/components/CommandPalette.jsx
31. frontend/src/components/CompanySelector.jsx
32. frontend/src/components/CostDashboard.jsx
33. frontend/src/components/CopyButton.jsx
34. frontend/src/components/DemoToggle.jsx
35. frontend/src/components/DependencyGraph.jsx
36. frontend/src/components/ExportPanel.jsx
37. frontend/src/components/HotkeyCheatSheet.jsx
38. frontend/src/components/OnboardingWizard.jsx
39. frontend/src/components/PromptVersionManager.jsx
40. frontend/src/components/RateLimitPanel.jsx
41. frontend/src/components/StatusDashboard.jsx
42. frontend/src/components/TaskList.jsx
43. frontend/src/components/TaskQueuePanel.jsx
44. frontend/src/components/TemplateLoader.jsx
45. frontend/src/components/UndoToast.jsx
46. frontend/public/favicon.svg
47. backend/test/helpers.js
48. backend/test/api.test.js
49. backend/test/rateLimits.test.js
50. docker-compose.prod.yml
51. .github/workflows/docker-build.yml
52. README_DOCKER.md
```

---

## WERYFIKACJA PO WYGENEROWANIU

Po wygenerowaniu wszystkich plików uruchom w tej kolejności:
```bash
# 1. Przejdź do katalogu projektu w VS Code Terminal
cd autonomous-office

# 2. Utwórz .env
cp .env.example .env

# 3. Uruchom
docker compose up --build

# 4. Czekaj na:
# biuro-backend  | ✅ Backend: http://localhost:3001
# biuro-frontend | ➜ Local: http://localhost:5173/

# 5. Otwórz w przeglądarce:
# http://localhost:5173
```

### Checklist – jeśli coś nie działa
```
□ docker --version          → musi być >= 24.x
□ docker compose version    → musi być >= 2.20
□ plik .env istnieje        → cp .env.example .env
□ port 3001 wolny           → lsof -i :3001
□ port 5173 wolny           → lsof -i :5173
□ backend/db.js używa DB_DIR, nie 'office.db'
□ frontend/vite.config.js ma __dirname polyfill dla ESM
□ frontend/index.html jest w frontend/ (nie w frontend/public/)
```

---

## UWAGI DLA VS CODE

- Zainstaluj rozszerzenie **Docker** (ms-azuretools.vscode-docker)
- Zainstaluj **ESLint** + **Prettier** dla JSX
- Terminal: użyj wbudowanego terminala VS Code (Ctrl+`)
- Po wygenerowaniu plików: `docker compose up --build` w terminalu
- Logi w czasie rzeczywistym: `docker compose logs -f`
- Hot-reload działa automatycznie – zapisz plik, przeglądarka odświeży się