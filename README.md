# Biuro v3 - Autonomiczne Biuro 2.0

Projekt zaawansowanego systemu autonomicznych agentów AI pracujących w ramach firmy.

## Główne Funkcje:
- **Autonomiczne Workflowy:** Agenci mogą delegować zadania między sobą za pomocą wzmianek `@NazwaAgenta`.
- **System Pokazowy (Demo):** Wbudowany scenariusz "E-commerce Demo" z predefiniowanymi rolami.
- **Pełna Kontrola:** Panel zatwierdzania zadań przekraczających limity kosztowe.
- **Monitoring i Audyt:** Pełna historia działań agentów oraz logi kosztowe.

## Struktura:
- `backend/`: Serwer Express.js + SQLite (Better-SQLite3).
- `frontend/`: Aplikacja React + Vite + Zustand.

## Jak uruchomić lokalnie:

### 1. Backend:
```bash
cd autonomous-office/backend
npm install
# Skopiuj .env.example do .env i uzupełnij klucze API
npm run dev
```

### 2. Frontend:
```bash
cd autonomous-office/frontend
npm install
npm run dev
```

## Testy:
W obu folderach (`backend` i `frontend`) dostępna jest komenda `npm test` uruchamiająca zestaw testów Vitest.
