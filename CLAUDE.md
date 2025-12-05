# AI Rules for fridgepick

# Aplikacja - FridgePick (MVP)

### Główny problem
Planowanie posiłków na podstawie zbioru dostępnych przepisów i bazy danych produktów i składników posiadanych przez użytkownika.

### Najmniejszy zestaw funkcjonalności
- Zapisywanie, odczytywanie, przeglądanie i usuwanie produktów i składników spożywczych które użytkownik posiada w swoim domu i lodówce z podziałem na kategorie
- Prosty system logowania i rejestracji
- Utrzymywanie, odczytywanie, przeglądanie i usuwanie przepisów z bazy danych
- Zainicjowanie bazy danych przepisów zestawem przykładowych przepisów na potrzeby testów
- Integracja z AI umożliwiająca inteligentne wybieranie przepisów na podstawie składników i produktów oraz preferencji użytkownika
- Tworzenie jadłospisu w ujęciu tygodniowym

### Co NIE wchodzi w zakres MVP
- Import zbioru przepisów z różnych źrodeł (książki w PDFie, strony internetowe)
- Preferencje uzytkownika na temat jadlospisu w ujęciu tygodniowym (zestaw preferencji należy dodefiniować)
- Aktualizowanie bazy danych produktów na podstawie zdjęć wnętrza lodówki, zdjęć zakupów lub paragonów

### Kryteria sukcesu
- Aplikacja pozwala na stworzenie jadłospisu tygodniowego (5 posiłków dziennie, zbilansowanych, na podstawie zbioru przepisów)
- Aplikacja nie "halucynuje", wybiera tylko przepisy możliwe do zrealizowania, przynajmniej w 90% (dopuszczalne pomijanie mniej istotnych składników przepisu)
- Uzytkownik ma możiwość zarządzania swoim zestawem produktów i składników


## CODING_PRACTICES

### Guidelines for SUPPORT_LEVEL

#### SUPPORT_EXPERT

- Favor elegant, maintainable solutions over verbose code. Assume understanding of language idioms and design patterns.
- Highlight potential performance implications and optimization opportunities in suggested code.
- Frame solutions within broader architectural contexts and suggest design alternatives when appropriate.
- Focus comments on 'why' not 'what' - assume code readability through well-named functions and variables.
- Proactively address edge cases, race conditions, and security considerations without being prompted.
- When debugging, provide targeted diagnostic approaches rather than shotgun solutions.
- Suggest comprehensive testing strategies rather than just example tests, including considerations for mocking, test organization, and coverage.


### Guidelines for VERSION_CONTROL

#### GIT

- Use conventional commits to create meaningful commit messages
- Use feature branches with descriptive names following {{branch_naming_convention}}
- Write meaningful commit messages that explain why changes were made, not just what
- Keep commits focused on single logical changes to facilitate code review and bisection
- Use interactive rebase to clean up history before merging feature branches
- Leverage git hooks to enforce code quality checks before commits and pushes

## FRONTEND

### Guidelines for REACT

#### REACT_CODING_STANDARDS

- Use functional components with hooks instead of class components
- Implement React.memo() for expensive components that render often with the same props
- Utilize React.lazy() and Suspense for code-splitting and performance optimization
- Use the useCallback hook for event handlers passed to child components to prevent unnecessary re-renders
- Prefer useMemo for expensive calculations to avoid recomputation on every render
- Implement useId() for generating unique IDs for accessibility attributes
- Use the new use hook for data fetching in React 19+ projects
- Leverage Server Components for {{data_fetching_heavy_components}} when using React with Next.js or similar frameworks
- Consider using the new useOptimistic hook for optimistic UI updates in forms
- Use useTransition for non-urgent state updates to keep the UI responsive


### Guidelines for ASTRO

#### ASTRO_CODING_STANDARDS

- Use Astro components (.astro) for static content and layout
- Implement framework components in {{framework_name}} only when interactivity is needed
- Leverage View Transitions API for smooth page transitions
- Use content collections with type safety for blog posts, documentation, etc.
- Implement middleware for request/response modification
- Use image optimization with the Astro Image integration
- Leverage Server Endpoints for API routes
- Implement hybrid rendering with server-side rendering where needed
- Use Astro.cookies for server-side cookie management
- Leverage import.meta.env for environment variables


### Guidelines for STYLING

#### TAILWIND

- Use the @layer directive to organize styles into components, utilities, and base layers
- Implement Just-in-Time (JIT) mode for development efficiency and smaller CSS bundles
- Use arbitrary values with square brackets (e.g., w-[123px]) for precise one-off designs
- Leverage the @apply directive in component classes to reuse utility combinations
- Implement the Tailwind configuration file for customizing theme, plugins, and variants
- Use component extraction for repeated UI patterns instead of copying utility classes
- Leverage the theme() function in CSS for accessing Tailwind theme values
- Implement dark mode with the dark: variant
- Use responsive variants (sm:, md:, lg:, etc.) for adaptive designs
- Leverage state variants (hover:, focus:, active:, etc.) for interactive elements

## BACKEND

### Guidelines for NODE

#### EXPRESS

- Use express-async-errors or wrap async route handlers in try/catch blocks to properly handle promise rejections and prevent server crashes
- Implement middleware for cross-cutting concerns like logging, error handling, and authentication following the chain-of-responsibility pattern
- Use helmet middleware to enhance API security with appropriate HTTP headers for {{security_requirements}}
- Structure routes using the Router class and organize by resource or feature to maintain a clean separation of concerns
- Implement rate limiting for public endpoints to prevent abuse and DoS attacks on {{critical_endpoints}}
- Use environment-specific configuration with dotenv and never hardcode sensitive values like {{database_credentials}} or API keys

## TESTING

### Guidelines for UNIT

#### JEST

- Use Jest with TypeScript for type checking in tests
- Implement Testing Library for component testing instead of enzyme
- Use snapshot testing sparingly and only for stable UI components
- Leverage mock functions and spies for isolating units of code
- Implement test setup and teardown with beforeEach and afterEach
- Use describe blocks for organizing related tests
- Leverage expect assertions with specific matchers
- Implement code coverage reporting with meaningful targets
- Use mockResolvedValue and mockRejectedValue for async testing
- Leverage fake timers for testing time-dependent functionality


### Guidelines for E2E

#### PLAYWRIGHT

- Initialize configuration only with Chromium/Desktop Chrome browser
- Use browser contexts for isolating test environments
- Implement the Page Object Model for maintainable tests
- Use locators for resilient element selection
- Leverage API testing for backend validation
- Implement visual comparison with expect(page).toHaveScreenshot()
- Use the codegen tool for test recording
- Leverage trace viewer for debugging test failures
- Implement test hooks for setup and teardown
- Use expect assertions with specific matchers
- Leverage parallel execution for faster test runs
