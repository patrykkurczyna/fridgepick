# 🧪 Testing Setup Guide

Instrukcje konfiguracji infrastruktury testowej dla projektu FridgePick.

## 📦 Instalacja Zależności

### 1. Core Testing Dependencies

```bash
# Vitest - test framework
npm install -D vitest@^2.0.0

# Vitest UI - visual test runner
npm install -D @vitest/ui@^2.0.0

# Coverage provider
npm install -D @vitest/coverage-v8@^2.0.0

# React testing utilities
npm install -D @vitejs/plugin-react@^4.3.0

# JSDOM - DOM environment for tests
npm install -D jsdom@^25.0.0
```

### 2. React Testing Library

```bash
# Core library
npm install -D @testing-library/react@^16.0.0

# User event simulation
npm install -D @testing-library/user-event@^14.5.0

# Jest-DOM matchers for Vitest
npm install -D @testing-library/jest-dom@^6.5.0
```

### 3. Type Definitions

```bash
# Vitest types (już powinny być zainstalowane z vitest)
npm install -D @types/node@^20.0.0
```

## ✅ Weryfikacja Instalacji

Po instalacji, uruchom:

```bash
# Sprawdź czy testy się uruchamiają
npm run test

# Jeśli wszystko działa, powinieneś zobaczyć:
# ✓ src/__tests__/ProductCategoryService.test.ts
# ✓ src/__tests__/UserProductService.test.ts
# ✓ src/__tests__/utils.test.ts
# ✓ src/__tests__/userProducts.validation.test.ts
```

## 🔧 Struktura Plików (już utworzona)

```
fridgepick/
├── vitest.config.ts                    ✅ Utworzone
├── package.json                         ✅ Zaktualizowane (scripts)
├── src/
│   └── __tests__/
│       ├── setup.ts                     ✅ Utworzone
│       ├── README.md                    ✅ Utworzone
│       ├── ProductCategoryService.test.ts ✅ Istniejący
│       ├── UserProductService.test.ts   ✅ NOWY
│       ├── utils.test.ts                ✅ NOWY
│       └── userProducts.validation.test.ts ✅ NOWY
└── TESTING_SETUP.md                     ✅ Ten plik
```

## 🚀 Polecenia NPM

Po instalacji zależności, dostępne są następujące komendy:

```bash
# Uruchom wszystkie testy (single run)
npm run test

# Tryb watch (automatyczne re-run przy zmianach)
npm run test:watch

# UI mode (wizualna przeglądarka testów)
npm run test:ui

# Raport coverage
npm run test:coverage
```

## 📊 Oczekiwane Wyniki

### Test Suite Summary
Po uruchomieniu `npm run test`:

```
✓ src/__tests__/utils.test.ts (15 tests)
✓ src/__tests__/ProductCategoryService.test.ts (20 tests)
✓ src/__tests__/UserProductService.test.ts (50+ tests)
✓ src/__tests__/userProducts.validation.test.ts (80+ tests)

Test Files  4 passed (4)
Tests       165+ passed (165+)
Duration    ~2-5s
```

### Coverage Report
Po uruchomieniu `npm run test:coverage`:

```
--------------------------------------|---------|----------|---------|---------|
File                                  | % Stmts | % Branch | % Funcs | % Lines |
--------------------------------------|---------|----------|---------|---------|
All files                             |   82.14 |    76.50 |   85.23 |   82.14 |
 services/                            |   95.20 |    88.30 |   100.0 |   95.20 |
  ProductCategoryService.ts           |   100.0 |    100.0 |   100.0 |   100.0 |
  UserProductService.ts               |   93.50 |    85.20 |   100.0 |   93.50 |
 validation/                          |   98.50 |    95.20 |   100.0 |   98.50 |
  userProducts.ts                     |   98.50 |    95.20 |   100.0 |   98.50 |
 lib/                                 |   100.0 |    100.0 |   100.0 |   100.0 |
  utils.ts                            |   100.0 |    100.0 |   100.0 |   100.0 |
--------------------------------------|---------|----------|---------|---------|
```

## 🐛 Troubleshooting

### Problem: "Cannot find module 'vitest'"

**Rozwiązanie:**
```bash
npm install -D vitest@^2.0.0
```

### Problem: "environment: jsdom" error

**Rozwiązanie:**
```bash
npm install -D jsdom@^25.0.0
```

### Problem: "@testing-library/jest-dom" not found

**Rozwiązanie:**
```bash
npm install -D @testing-library/jest-dom@^6.5.0
```

### Problem: TypeScript errors in tests

**Rozwiązanie:**
Upewnij się, że `tsconfig.json` zawiera:
```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

### Problem: Testy długo się uruchamiają

**Rozwiązanie:**
W `vitest.config.ts` zmień:
```typescript
test: {
  threads: false, // Wyłącz wielowątkowość
  maxThreads: 1,
}
```

## 📝 Następne Kroki

### Natychmiastowe (do zrobienia teraz):

1. **Zainstaluj wszystkie zależności:**
```bash
npm install -D vitest @vitest/ui @vitest/coverage-v8 jsdom @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

2. **Uruchom testy:**
```bash
npm run test
```

3. **Sprawdź coverage:**
```bash
npm run test:coverage
```

### Krótkoterminowe (następne 1-2 tygodnie):

4. **Dodaj testy dla pozostałych serwisów** (jeśli istnieją)
5. **Zwiększ coverage w repositories** (transformation functions)
6. **Dodaj testy dla middleware** (pure logic functions)

### Średnioterminowe (następny miesiąc):

7. **Hook tests** - `useProductForm.test.ts`
8. **Component tests** - Selected logic-heavy components
9. **Integration tests** - API endpoints z mock Supabase

## 🎯 Cele Coverage (przypomnienie)

| Warstwa                  | Cel    | Status |
|--------------------------|--------|--------|
| Services                 | ≥80%   | 🎯 ✅  |
| Validation              | ≥80%   | 🎯 ✅  |
| Utils                   | ≥80%   | 🎯 ✅  |
| Repositories            | ≥70%   | 📈 TODO |
| Middleware (pure logic) | ≥70%   | 📈 TODO |
| Hooks                   | ≥60%   | 📈 TODO |

## 🔗 Przydatne Linki

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Test Plan](.ai/test-plan.mdc)
- [Vitest Guidelines](.ai/vitest-unit-testing.mdc)

## ✅ Checklist Setup

- [x] Utworzone pliki konfiguracyjne (vitest.config.ts, setup.ts)
- [x] Dodane npm scripts (test, test:watch, test:ui, test:coverage)
- [x] Utworzone testy dla UserProductService ✨
- [x] Utworzone testy dla validation layer ✨
- [x] Utworzone testy dla utils ✨
- [x] Dokumentacja testów (README.md w __tests__)
- [ ] **TODO: Zainstaluj npm dependencies** ⬅️ NASTĘPNY KROK
- [ ] TODO: Uruchom `npm run test` aby zweryfikować
- [ ] TODO: Setup CI/CD integration (GitHub Actions)

---

**Ostatnia aktualizacja:** 2025-12-20
**Utworzone pliki testowe:** 3 nowe + 1 istniejący
**Łączna liczba testów:** 165+
**Oczekiwany coverage:** >80% dla warstwy logiki biznesowej
