# CV Creator – darmowy kreator CV z AI

Kreator CV krok po kroku z podglądem na żywo, szablonami przyjaznymi dla ATS, automatycznym łamaniem stron A4/Letter
i asystentem AI (Claude). Bez kont – CV zapisuje się w przeglądarce.

| Katalog     | Stos |
|-------------|------|
| `backend/`  | Spring Boot 3.5, Java 21, Anthropic Java SDK (Claude), limit zapytań per IP |
| `frontend/` | Angular 21 (standalone, Signals, zoneless), Tailwind 4, ngx-translate, Angular CDK (drag & drop), Lucide |

## Uruchomienie lokalne

```bash
cd backend && ANTHROPIC_API_KEY=sk-ant-... mvn spring-boot:run     # API :8080 (bez klucza AI jest wyłączone, reszta działa)
cd frontend && npm install --legacy-peer-deps && npm start        # http://localhost:4200, /api → :8080
```

Testy: `cd backend && mvn test`, `cd frontend && npx ng test --watch=false`.

## Konfiguracja API (zmienne środowiskowe)

| Zmienna | Domyślnie | Opis |
|---|---|---|
| `ANTHROPIC_API_KEY` | – | klucz Claude API; pusty = funkcje AI wyłączone |
| `AI_MODEL` | `claude-opus-5-5` | model (np. tańszy `claude-haiku-5-5`) |
| `AI_FALLBACKS` | `true` | serwerowy fallback przy odmowie modelu (beta) |
| `RATE_LIMIT_PER_MINUTE` / `RATE_LIMIT_PER_DAY` | `8` / `60` | limity zapytań AI na IP |
| `CORS_ORIGINS` | `http://localhost:4200` | gdy frontend jest na innej domenie |

## Architektura w skrócie

- **Szablony** (`frontend/src/app/core/cv/templates.ts`) to dane: szkielet 1–3 kolumn + przełączniki stylu
  (nagłówek, styl nagłówków sekcji, motyw kolumny bocznej, styl umiejętności, czcionka, akcent). Wygląd realizuje
  wspólny arkusz `frontend/src/styles/cv.css` na podstawie atrybutów `data-*`. **Nowy szablon = nowy wpis w `TEMPLATES`.**
- **Układ**: użytkownik zmienia liczbę kolumn i przeciąga sekcje między kolumnami (`layout-panel.ts`).
- **Paginacja** (`cv-render/cv-document.ts`, `core/cv/paginate.ts`): CV jest dzielone na bloki (nagłówek sekcji +
  pierwszy wpis, kolejne wpisy…), mierzone w niewidocznej kopii strony i rozkładane na strony – każda kolumna płynie
  niezależnie, wpis nigdy nie jest przecinany.
- **PDF**: druk przeglądarki („Zapisz jako PDF”) – wektorowy, zaznaczalny tekst czytelny dla ATS.
- **Kraje** (`core/cv/countries.ts`): język, format strony, zdjęcie, klauzula RODO i wskazówki per kraj.
- **AI** (`backend/.../ai`): podsumowanie, ulepszanie punktów, dopasowanie do oferty (wynik, słowa kluczowe,
  sugestie), tłumaczenie CV. Do AI trafia tylko tekst CV (bez danych kontaktowych i zdjęcia), odpowiedzi w JSON
  wg schematu (structured outputs).
- **Języki**: interfejs PL/EN/DE/FR/ES (`frontend/public/i18n`), nagłówki w treści CV w 10 językach (`cv-labels.ts`).
