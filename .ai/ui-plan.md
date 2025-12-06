# Architektura UI dla FridgePick MVP

## 1. Przegląd struktury UI

FridgePick to responsywna aplikacja webowa zbudowana w architekturze mobile-first z adaptacją na większe ekrany. Aplikacja wykorzystuje trzysegmentową nawigację główną (Lodówka, Przepisy, Plan tygodnia) z dodatkowymi widokami dla autoryzacji, szczegółów i zarządzania preferencjami. Struktura UI jest zoptymalizowana pod szybki dostęp do kluczowych funkcji przy zachowaniu prostoty MVP.

Architektura opiera się na feature-based folder structure z React Context API do zarządzania stanem. Komponenty wykorzystują card layout dla lepszej czytelności, a loading states są zaprojektowane z użyciem skeletonów i progress indicators dla operacji AI.

## 2. Lista widoków

### 2.1 Landing/Welcome
- **Ścieżka widoku:** `/`
- **Główny cel:** Przedstawienie aplikacji i zachęcenie do rejestracji lub wypróbowania demo
- **Kluczowe informacje:** Value proposition, funkcjonalności aplikacji, opcje logowania
- **Kluczowe komponenty:**
  - Hero section z opisem aplikacji
  - CTA buttons: "Wypróbuj demo" i "Zarejestruj się"
  - Feature highlights carousel
- **UX/Accessibility:** Semantic HTML, clear contrast, keyboard navigation, focus indicators
- **Bezpieczeństwo:** Brak wrażliwych danych, podstawowa walidacja formularzy

### 2.2 Rejestracja
- **Ścieżka widoku:** `/register`
- **Główny cel:** Umożliwienie utworzenia konta użytkownika
- **Kluczowe informacje:** Formularz rejestracyjny, komunikaty walidacji
- **Kluczowe komponenty:**
  - RegistrationForm z polami: email, password, password confirmation
  - PasswordStrengthIndicator
  - ValidationMessages component
  - "Masz już konto?" link do logowania
- **UX/Accessibility:** Progressive validation, clear error messages, proper form labels
- **Bezpieczeństwo:** Password strength validation, input sanitization, CSRF protection

### 2.3 Logowanie
- **Ścieżka widoku:** `/login`
- **Główny cel:** Autoryzacja zarejestrowanych użytkowników
- **Kluczowe informacje:** Formularz logowania, opcje odzyskiwania hasła
- **Kluczowe komponenty:**
  - LoginForm z polami email/password
  - "Zapamiętaj mnie" checkbox
  - "Zapomniałem hasła" link
  - Link do rejestracji
- **UX/Accessibility:** Auto-focus na pierwszym polu, enter key submission
- **Bezpieczeństwo:** Rate limiting UI feedback, secure token storage

### 2.4 Reset hasła
- **Ścieżka widoku:** `/reset-password`
- **Główny cel:** Umożliwienie zresetowania zapomnianego hasła
- **Kluczowe informacje:** Formularz email, potwierdzenie wysłania
- **Kluczowe komponenty:**
  - EmailForm dla resetu
  - SuccessMessage po wysłaniu
  - Timer dla ponownego wysłania
- **UX/Accessibility:** Clear instructions, feedback messages
- **Bezpieczeństwo:** Rate limiting, email validation

### 2.5 Tryb Demo
- **Ścieżka widoku:** `/demo`
- **Główny cel:** Prezentacja funkcjonalności bez rejestracji
- **Kluczowe informacje:** Persistent demo banner, predefiniowane dane
- **Kluczowe komponenty:**
  - DemoBanner component - "TRYB DEMO"
  - Wszystkie standardowe komponenty z demo data
  - ConversionPrompt do rejestracji
- **UX/Accessibility:** Different color scheme, gentle conversion reminders
- **Bezpieczeństwo:** Read-only operations, session timeout handling

### 2.6 Dashboard/Home (po zalogowaniu)
- **Ścieżka widoku:** `/dashboard`
- **Główny cel:** Główny hub z przeglądem stanu aplikacji
- **Kluczowe informacje:** Podsumowanie produktów, ostatnie przepisy, aktywny plan
- **Kluczowe komponenty:**
  - ProductsSummaryCard - liczba produktów, expiring soon
  - RecentRecipesSlider
  - ActiveMealPlanCard
  - QuickActions - dodaj produkt, znajdź przepis
- **UX/Accessibility:** Card-based layout, clear visual hierarchy
- **Bezpieczeństwo:** Session validation, secure data fetching

### 2.7 Lodówka - Lista produktów
- **Ścieżka widoku:** `/fridge`
- **Główny cel:** Zarządzanie inventory produktów użytkownika
- **Kluczowe informacje:** Lista produktów, daty ważności, kategorie, ilości
- **Kluczowe komponenty:**
  - ProductsList z ProductCard components
  - QuickAddPanel dla popularnych produktów
  - SearchBar dla filtrowania
  - SortControls (expiry date default)
  - AddProductButton (floating action)
  - EmptyState z friendly illustration
- **UX/Accessibility:** Visual expiry indicators, touch-friendly controls, skeleton loading
- **Bezpieczeństwo:** Input validation, authorization checks

### 2.8 Dodawanie produktu
- **Ścieżka widoku:** `/fridge/add`
- **Główny cel:** Formularz dodawania nowego produktu
- **Kluczowe informacje:** Pola formularza, kategorie, jednostki
- **Kluczowe komponenty:**
  - ProductForm z polami: name, category, quantity, unit, expiry date
  - CategoryDropdown
  - UnitSelector
  - DatePicker
  - SaveButton i CancelButton
- **UX/Accessibility:** Progressive validation, clear field labels, date picker accessibility
- **Bezpieczeństwo:** Input validation, category verification

### 2.9 Edycja produktu
- **Ścieżka widoku:** `/fridge/edit/:id`
- **Główny cel:** Modyfikacja istniejącego produktu
- **Kluczowe informacje:** Wypełniony formularz z aktualnymi danymi
- **Kluczowe komponenty:**
  - ProductForm (reused) z pre-filled data
  - DeleteButton z confirmation
  - Loading state podczas fetch
- **UX/Accessibility:** Pre-filled form values, clear save/cancel actions
- **Bezpieczeństwo:** Ownership verification, validation

### 2.10 Przepisy - Przeglądanie
- **Ścieżka widoku:** `/recipes`
- **Główny cel:** Eksploracja dostępnych przepisów
- **Kluczowe informacje:** Lista wszystkich przepisów, podstawowe filtry
- **Kluczowe komponenty:**
  - RecipeGrid z RecipeCard components
  - SearchBar
  - BasicFilters (meal category, protein type)
  - RecommendationsButton - link do AI matching
  - PaginationControls
- **UX/Accessibility:** Card grid layout, lazy loading images, keyboard navigation
- **Bezpieczeństwo:** Safe image loading, input sanitization

### 2.11 Rekomendacje AI
- **Ścieżka widoku:** `/recipes/recommendations`
- **Główny cel:** AI-powered dopasowywanie przepisów do składników użytkownika
- **Kluczowe informacje:** Przepisy z level matching, brakujące składniki
- **Kluczowe komponenty:**
  - MatchLevelTabs (idealny, prawie idealny, wymaga dokupienia)
  - RecommendedRecipeCard z match indicators
  - MissingIngredientsTag
  - RefreshRecommendationsButton
  - LoadingStateWithProgress podczas AI processing
- **UX/Accessibility:** Color-coded matching levels, clear missing ingredient indicators
- **Bezpieczeństwo:** Rate limiting UI feedback, secure AI API calls

### 2.12 Szczegóły przepisu
- **Ścieżka widoku:** `/recipes/:id`
- **Główny cel:** Pełna prezentacja przepisu z możliwością gotowania
- **Kluczowe informacje:** Składniki, instrukcje, wartości odżywcze, dostępność składników
- **Kluczowe komponenty:**
  - StickyHeader z nazwą, czasem, kaloriami
  - IngredientsSection z availability indicators
  - InstructionsSection (HTML content)
  - NutritionalInfo panel
  - CookButton - "Ugotowane"
  - AvailabilityIndicators dla składników
- **UX/Accessibility:** Sticky navigation, clear ingredient availability, semantic HTML for instructions
- **Bezpieczeństwo:** Safe HTML rendering, ingredient verification

### 2.13 Preferencje żywieniowe
- **Ścieżka widoku:** `/preferences`
- **Główny cel:** Konfiguracja preferencji dla AI meal planning
- **Kluczowe informacje:** Slidery dla różnych preferencji, kalorie dzienne
- **Kluczowe komponenty:**
  - PreferencesForm ze sliderami
  - RangeSlider components dla meat/fish/vege meals
  - CalorieInput
  - SaveButton z loading state
  - ResetToDefaultsButton
- **UX/Accessibility:** Slider accessibility, clear labels, immediate feedback
- **Bezpieczeństwo:** Range validation, secure preferences storage

### 2.14 Plan tygodnia - Overview
- **Ścieżka widoku:** `/meal-plan`
- **Główny cel:** Prezentacja aktywnego planu tygodniowego
- **Kluczowe informacje:** 7 dni × 5 posiłków, kalorie dzienne, shopping list
- **Kluczowe komponenty:**
  - WeeklyCalendar (hybrid: compact mobile, full desktop)
  - DayView z MealCard components
  - CalorieBadge dla każdego dnia
  - GenerateNewPlanButton
  - ShoppingListPanel (read-only)
  - EmptyPlanState z CTA
- **UX/Accessibility:** Responsive calendar view, clear meal information
- **Bezpieczeństwo:** Plan ownership verification

### 2.15 Generowanie planu
- **Ścieżka widoku:** `/meal-plan/generate`
- **Główny cel:** AI-powered generowanie nowego jadłospisu
- **Kluczowe informacje:** Parametry generowania, progress AI, rezultat
- **Kluczowe komponenty:**
  - GenerationForm z opcjami (week start, preferences usage)
  - ProgressIndicator z komunikatami ("Analizuję składniki...")
  - CancelButton dla operacji AI
  - ResultSummary po zakończeniu
  - ErrorState dla niepowodzeń AI
- **UX/Accessibility:** Progress feedback, cancel capability, clear error handling
- **Bezpieczeństwo:** Timeout handling, secure AI integration

### 2.16 Historia gotowania
- **Ścieżka widoku:** `/cooking-history`
- **Główny cel:** Przeglądanie wcześniej ugotowanych przepisów
- **Kluczowe informacje:** Lista ugotowanych posiłków z datami
- **Kluczowe komponenty:**
  - CookedMealsList z timeline layout
  - FilterControls (data, przepis)
  - CookedMealCard z informacjami o porsjach
  - EmptyHistoryState
- **UX/Accessibility:** Chronological layout, clear meal information
- **Bezpieczeństwo:** User data isolation

### 2.17 Profil użytkownika
- **Ścieżka widoku:** `/profile`
- **Główny cel:** Zarządzanie kontem i ustawieniami
- **Kluczowe informacje:** Dane konta, statystyki użytkowania
- **Kluczowe komponenty:**
  - ProfileInfo section
  - AccountSettings
  - UsageStats (przepisy ugotowane, produkty dodane)
  - LogoutButton
  - DeleteAccountButton (z confirmacją)
- **UX/Accessibility:** Clear account actions, usage insights
- **Bezpieczeństwo:** Secure logout, account deletion confirmation

## 3. Mapa podróży użytkownika

### 3.1 Nowy użytkownik - Pierwsze użycie
1. **Landing** → Prezentacja value proposition
2. **Decyzja:** Demo lub rejestracja
3. **Demo/Rejestracja** → Utworzenie konta lub eksploracja
4. **Dashboard** → Pierwsza wizja aplikacji
5. **Lodówka** → Dodanie pierwszych produktów (onboarding guidance)
6. **Przepisy/Rekomendacje** → Odkrycie AI matching
7. **Szczegóły przepisu** → Pierwsze gotowanie
8. **Plan tygodnia** → Generowanie pierwszego planu

### 3.2 Powracający użytkownik - Typowa sesja
1. **Logowanie** → Szybki dostęp do konta
2. **Dashboard** → Przegląd stanu (expiring products, aktywny plan)
3. **Akcja główna:**
   - **Lodówka** → Aktualizacja inventory
   - **Rekomendacje AI** → Wyszukiwanie przepisu na dziś
   - **Plan tygodnia** → Sprawdzenie kolejnych posiłków
4. **Gotowanie** → Oznaczenie jako ugotowane
5. **Logout/Continue browsing**

### 3.3 Advanced user - Weekly planning
1. **Dashboard** → Quick overview
2. **Preferencje** → Dostosowanie preferencji żywieniowych
3. **Lodówka** → Inwentaryzacja przed planowaniem
4. **Generowanie planu** → AI creation z custom parameters
5. **Plan review** → Przegląd i potential adjustments
6. **Shopping list** → Przygotowanie zakupów
7. **Daily cooking** → Regularne używanie planów

## 4. Układ i struktura nawigacji

### 4.1 Główna nawigacja
**Mobile (Bottom Navigation):**
- Lodówka (fridge icon)
- Przepisy (recipe book icon) 
- Plan (calendar icon)

**Desktop (Top Navigation):**
- Logo/Home (left)
- Lodówka | Przepisy | Plan (center)
- Profil/Menu (right)

### 4.2 Nawigacja pomocnicza
- **Back buttons** dla szczegółowych widoków
- **Floating Action Buttons** dla głównych akcji (dodaj produkt)
- **Breadcrumb alternative:** Clear page titles z kontekstem
- **User menu:** Profil, Preferencje, Historia, Logout

### 4.3 Responsive behavior
- **Mobile:** Bottom nav visible, collapsible filters, stacked layouts
- **Tablet:** Hybrid approach, some sidebar elements
- **Desktop:** Full navigation, side panels, multi-column layouts

### 4.4 Accessibility navigation
- **Skip links** dla main content
- **Focus management** przy modal dialogs
- **Keyboard shortcuts** będą dodane w przyszłości
- **Screen reader** friendly navigation landmarks

## 5. Kluczowe komponenty

### 5.1 Layout Components
- **AppLayout:** Main wrapper z navigation i content area
- **NavigationBar:** Responsive nav z route highlighting
- **PageHeader:** Consistent page titles z optional actions
- **Sidebar:** Desktop auxiliary content panel

### 5.2 Data Display Components
- **ProductCard:** Product display z expiry indicators
- **RecipeCard:** Recipe preview z match level indicators  
- **MealCard:** Meal info dla weekly planning
- **MatchIndicator:** Color-coded recipe matching levels

### 5.3 Form Components
- **FormField:** Reusable input wrapper z validation
- **CategorySelect:** Dropdown dla product categories
- **DatePicker:** Accessible date selection
- **RangeSlider:** Preferences numerical inputs

### 5.4 Interaction Components
- **QuickAddPanel:** Fast product addition
- **LoadingSkeleton:** Placeholder dla loading states
- **ProgressIndicator:** AI operations feedback
- **ToastNotification:** Success/error messages

### 5.5 State Management Components
- **AuthProvider:** User session context
- **InventoryProvider:** Products state management
- **PreferencesProvider:** User preferences context
- **ErrorBoundary:** Graceful error handling

### 5.6 AI Integration Components
- **RecommendationEngine:** AI matching display
- **MealPlanGenerator:** AI planning workflow
- **IngredientMatcher:** Availability checking
- **CacheIndicator:** AI cache status display

Architektura UI została zaprojektowana z naciskiem na prostotę MVP przy zachowaniu skalowalności dla przyszłych funkcjonalności. Wszystkie komponenty podporządkują się design system z konsystentnymi patterns dla loading states, error handling i user feedback.