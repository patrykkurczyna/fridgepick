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
