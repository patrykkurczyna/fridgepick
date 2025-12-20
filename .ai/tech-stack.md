⏺ TESTING FRAMEWORK

🧪 TESTY JEDNOSTKOWE I INTEGRACYJNE

**Vitest** - Modern testing framework
- Natywna obsługa ESM i TypeScript
- Kompatybilność z Vite dla szybkich testów
- Built-in coverage z v8 provider
- Watch mode dla development workflow
- Inline snapshots dla readable assertions

**@testing-library/react** - Component testing
- User-centric testing approach
- Realistic user interaction simulation
- Accessibility-focused queries
- Integration z Vitest i jsdom environment

**Kluczowe wskaźniki:**
- Code coverage: >80% dla logiki biznesowej
- Code coverage: >70% dla komponentów UI
- Test execution time: <30s dla unit tests
- Wszystkie testy muszą być deterministyczne (no flaky tests)

**Najlepsze praktyki:**
- Używaj `vi.fn()` dla function mocks, `vi.spyOn()` dla monitorowania funkcji
- Factory patterns w `vi.mock()` na top-level pliku testowego
- Setup files dla reusable configuration w `vitest.config.ts`
- Inline snapshots `toMatchInlineSnapshot()` dla czytelnych asercji
- Watch mode `vitest --watch` podczas developmentu
- UI mode `vitest --ui` dla complex test suites
- jsdom environment dla DOM testing
- Struktura Arrange-Act-Assert dla maintainability
- TypeScript strict typing w testach z `expectTypeOf()`

🎭 TESTY END-TO-END

**Playwright** - E2E testing framework
- Konfiguracja TYLKO dla Chromium/Desktop Chrome
- Browser contexts dla izolacji środowisk testowych
- Page Object Model dla maintainable tests
- Auto-waiting i smart locators
- Screenshot i trace capabilities dla debugging
- Parallel execution dla szybkich testów

**Zakres testów E2E:**
- Pełne user flows autentykacji (login, register, reset password)
- Zarządzanie produktami (CRUD operations)
- Wyszukiwanie, filtrowanie, paginacja
- Formularze i walidacja
- Error states i loading states
- Responsywność UI

**Najlepsze praktyki:**
- Page Object Model dla organizacji testów
- Resilient element selection z locators
- API testing dla backend validation
- Visual comparison z `expect(page).toHaveScreenshot()`
- codegen tool dla recording testów
- Trace viewer dla debugging failures
- Test hooks dla setup/teardown
- Specific matchers w assertions
- Parallel execution dla performance

**Kluczowe wskaźniki:**
- Flakiness rate: <5%
- Test execution time: <5 minut dla full suite
- Critical path coverage: 100%

🔍 STRATEGIA TESTOWANIA

**Test Pyramid:**
1. **Unit Tests** (najwięcej, najszybsze)
   - Services, repositories, hooks, utils
   - Isolated component testing
   - Pure function testing

2. **Integration Tests** (moderate)
   - Supabase integration
   - API endpoints
   - Middleware chains
   - Component + API integration

3. **E2E Tests** (najmniej, najwolniejsze)
   - Critical user journeys
   - Authentication flows
   - Core business workflows

**CI/CD Integration:**
- Wszystkie testy uruchamiane przy każdym PR
- Pre-commit hooks z lint-staged dla quick checks
- Automated coverage reports
- Blocking deployments przy failed tests

**Test Data Management:**
- Dedicated test users i fixtures
- Database seeding dla consistent state
- Cleanup po każdym teście (isolation)
- Mock external services (AI, email)

⏺ REKOMENDACJE

🎨 UI/UX CODING STANDARDS

1. **Interactive Elements - Cursor Pointer**
   - ZAWSZE dodawaj `cursor-pointer` (Tailwind) lub `cursor: pointer` (CSS) do wszystkich interaktywnych elementów
   - Dotyczy: buttons, links, clickable divs, icons, cards z onClick/onClickhandlers
   - Wyjątki: elementy z `disabled` powinny mieć `cursor-not-allowed`
   - Przykład Tailwind: `className="... cursor-pointer hover:bg-gray-100"`
   - Przykład CSS: `style={{ cursor: 'pointer' }}`

2. **ESLint & Code Quality - KRYTYCZNE**
   - **ZAWSZE uruchamiaj `npm run lint` PRZED commitowaniem kodu**
   - **NAPRAW wszystkie błędy lintingu zanim przejdziesz dalej**
   - Linting ma NAJWYŻSZY priorytet - kod z błędami lintingu nie może być commitowany
   - Po każdej zmianie w kodzie uruchom: `npm run lint -- --fix` (auto-fix formatowania)
   - Wszystkie pozostałe błędy (unused vars, any types, etc.) muszą być naprawione ręcznie
   - Zero tolerancji dla: unused variables, explicit `any` types, empty interfaces
   - Warningi console.log są dozwolone tylko dla debugowania (usuń przed production)

🔴 KRYTYCZNE PROBLEMY Z OBECNYM STACKIEM

1. Astro 5 to overengineering
- PRD wskazuje na prostą aplikację CRUD z AI
- Astro komplikuje architekturę bez realnych korzyści
- Ryzyko związane z najnowszą wersją

2. Potencjalnie wysokie koszty AI
- Brak mechanizmów kontroli kosztów
- Każde wyszukiwanie przepisów = wywołanie AI

🟨 SUGEROWANA ALTERNATYWA DLA MVP

Frontend: Next.js 14 + TypeScript + Tailwind + Shadcn/ui
Backend: Next.js API Routes + Prisma
Database: PlanetScale (MySQL) lub Neon (PostgreSQL)
AI: OpenRouter.ai z cachingiem i rate limiting
Hosting: Vercel (zero config deployment)

Dlaczego lepsze:
- Szybszy development - jeden framework, mniej konfiguracji
- Niższe koszty - Vercel hobby plan, PlanetScale/Neon mają generous free tiers
- Prostsza architektura - pełny stack w jednym repo
- Lepsze wsparcie - stabilne technologie z dużą społecznością

✅ CO ZOSTAJE Z ORYGINALNEGO STACKU

- TypeScript - konieczne dla jakości kodu
- Tailwind + Shadcn/ui - świetna kombinacja dla UI
- OpenRouter.ai - dobra elastyczność w modelach AI
- GitHub Actions - sprawdzone CI/CD
- Docker - dobra dla deployment consistency

🛡️ KONIECZNE ZABEZPIECZENIA

1. Caching wyników AI (Redis/Upstash) - 80% oszczędności kosztów
2. Rate limiting - nie więcej niż X wywołań AI/user/hour
3. Input validation - szczególnie dla przepisów JSON
4. Error boundaries - graceful degradation AI features

💡 KOMPROMISOWE ROZWIĄZANIE

Jeśli koniecznie chcesz zostać przy Astro:
- Użyj Astro 4 (stabilniejsze) zamiast 5
- Dodaj Redis dla cachingu AI
- Zastąp Supabase → Prisma + PlanetScale
- Kosztorys przed każdą implementacją AI feature

⏺ Update Todos
⎿  ☒ Analyze tech stack against PRD requirements
☒ Evaluate speed of MVP delivery
☒ Assess scalability and cost implications
☒ Consider simpler alternatives
☒ Analyze security considerations
☒ Provide final recommendations

⏺ WNIOSEK: Obecny stack technologiczny jest zbyt skomplikowany jak na wymagania MVP. Rekomenduje
prostsze rozwiązanie oparte o Next.js, które przyspieszy development i obniży koszty,
zachowując wszystkie wymagane funkcjonalności z PRD.
