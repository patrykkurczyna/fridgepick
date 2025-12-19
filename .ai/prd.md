# Dokument wymagań produktu (PRD) - FridgePick

## 1. Przegląd produktu

### 1.1 Nazwa produktu
FridgePick - inteligentna aplikacja do planowania posiłków

### 1.2 Wizja produktu
FridgePick to responsywna aplikacja webowa, która pomaga użytkownikom efektywnie zarządzać produktami spożywczymi i planować zbilansowane posiłki na podstawie dostępnych składników. Aplikacja wykorzystuje sztuczną inteligencję do inteligentnego doboru przepisów i tworzenia tygodniowych jadłospisów.

### 1.3 Cel biznesowy
Stworzenie MVP aplikacji, która umożliwi użytkownikom:
- Zarządzanie produktami w lodówce i spiżarni
- Wyszukiwanie przepisów na podstawie dostępnych składników
- Generowanie zbilansowanych jadłospisów tygodniowych
- Automatyczne aktualizowanie stanów produktów po przygotowaniu posiłków

### 1.4 Grupa docelowa
- Osoby prowadzące gospodarstwo domowe
- Użytkownicy dbający o zbilansowaną dietę
- Osoby chcące ograniczyć marnowanie żywności
- Użytkownicy poszukujący inspiracji kulinarnych

### 1.5 Platforma
Responsywna aplikacja webowa (priorytetowa platforma dla MVP)

## 2. Problem użytkownika

### 2.1 Główny problem
Użytkownicy mają trudności z efektywnym planowaniem posiłków na podstawie posiadanych produktów spożywczych, co prowadzi do:
- Marnowania żywności
- Powtarzalności w przygotowywanych posiłkach
- Trudności w utrzymaniu zbilansowanej diety
- Częstego dokupywania niepotrzebnych składników

### 2.2 Bolączki użytkowników
- Brak przeglądu posiadanych produktów i ich dat ważności
- Trudności w znalezieniu przepisów dopasowanych do dostępnych składników
- Brak narzędzi do planowania tygodniowych jadłospisów
- Konieczność ręcznego śledzenia zużycia produktów

### 2.3 Wartość dodana rozwiązania
- Centralne zarządzanie produktami spożywczymi
- AI-napędzane dopasowywanie przepisów
- Automatyczne planowanie zbilansowanych jadłospisów
- Automatyczne aktualizowanie stanów produktów po gotowaniu

## 3. Wymagania funkcjonalne

### 3.1 Zarządzanie produktami (MUST)
- Dodawanie produktów przez prosty formularz (nazwa, kategoria, data ważności, jednostka, ilość)
- Przeglądanie listy produktów z podziałem na kategorie
- Edycja i usuwanie produktów
- Automatyczne aktualizowanie ilości produktów po użyciu w przepisach
- Kategorie produktów: nabiał, mięso, pieczywo, warzywa, owoce

### 3.2 Baza przepisów i dopasowywanie (MUST)
- Seedowa baza przepisów w formacie JSON
- Standardowy schemat przepisu obejmujący:
  - Składniki kluczowe (nazwa + ilość)
  - Składniki opcjonalne (nazwa + ilość)
  - Liczbę porcji
  - Czas przygotowania
  - Wartości odżywcze
  - Opis krok po kroku w formacie HTML
- AI dopasowuje przepisy na podstawie posiadanych produktów, preferencji użytkownika i zasad zróżnicowania
- Trzy poziomy dopasowania: "idealny", "prawie idealny", "wymaga dokupienia"
- Prezentacja brakujących składników

### 3.3 Wyszukiwanie i filtrowanie przepisów (MUST)
- Wyszukiwanie na podstawie posiadanych produktów
- Filtrowanie po kategorii posiłku: śniadanie, obiad, kolacja, przekąska
- Filtrowanie po rodzaju białka: ryba, drób, czerwone mięso, vege
- Priorytetyzacja przepisów wykorzystujących produkty bliskie wygaśnięcia

### 3.4 Planowanie tygodniowego jadłospisu (SHOULD)
- Generowanie planu tygodniowego (5 posiłków dziennie)
- Uwzględnienie preferencji użytkownika
- Prezentacja w formie przejrzystego ekranu/dokumentu
- Podstawowe informacje o każdym posiłku

### 3.5 Preferencje użytkownika (SHOULD)
- Maksymalna liczba obiadów mięsnych w tygodniu
- Minimalna/maksymalna liczba obiadów rybnych
- Liczba obiadów wegetariańskich
- Liczba śniadań/kolacji z jajkami
- Podział śniadań na słodkie vs słone
- Dzienna kaloryczność

### 3.6 System autoryzacji (MUST/SHOULD)
- Rejestracja z loginem i hasłem (MUST)
- Link aktywacyjny na email (SHOULD)
- Reset hasła (SHOULD)
- Tryb demo bez logowania z przykładowymi danymi

### 3.7 CRUD przepisów (NICE)
- Przeglądanie przepisów przez użytkownika
- Dodawanie własnych przepisów
- Usuwanie przepisów

## 4. Granice produktu

### 4.1 Co JEST w zakresie MVP
- Responsywna aplikacja webowa
- Ręczne dodawanie produktów przez formularz
- Seedowa baza przepisów w JSON
- AI dopasowywanie istniejących przepisów
- Podstawowe planowanie tygodniowe
- Prosty system logowania
- Tryb demo
- Automatyczne aktualizowanie stanów produktów

### 4.2 Co NIE JEST w zakresie MVP
- Aplikacje mobilne natywne
- Import przepisów z zewnętrznych źródeł
- Skanowanie kodów kreskowych
- Rozpoznawanie produktów ze zdjęć
- Generowanie nowych przepisów przez AI
- Zaawansowana edycja planów tygodniowych
- Logowanie przez Google
- Integracja z zewnętrznymi bazami składników
- Panel administracyjny
- Powiadomienia push
- Funkcje społecznościowe

### 4.3 Założenia techniczne
- Jeden developer
- Mocne cięcie zakresu funkcjonalnego
- Priorytet na szybkie dostarczenie MVP
- Seedowa baza przepisów zamiast złożonego systemu zarządzania

## 5. Historyjki użytkowników

### US-001: Rejestracja użytkownika
**Opis:** Jako nowy użytkownik chcę zarejestrować się w aplikacji, aby móc korzystać z jej funkcjonalności.
**Kryteria akceptacji:**
- Formularz rejestracji z polami: email, hasło, potwierdzenie hasła
- Walidacja formatu email i siły hasła
- Wysłanie linka aktywacyjnego na podany email
- Potwierdzenie rejestracji po kliknięciu w link
- Komunikat o pomyślnej rejestracji

### US-002: Logowanie użytkownika
**Opis:** Jako zarejestrowany użytkownik chcę zalogować się do aplikacji, aby uzyskać dostęp do moich danych.
**Kryteria akceptacji:**
- Formularz logowania z polami email i hasło
- Walidacja danych logowania
- Przekierowanie do głównego ekranu po pomyślnym logowaniu
- Komunikat błędu przy nieprawidłowych danych
- Opcja "Zapamiętaj mnie"

### US-003: Reset hasła
**Opis:** Jako użytkownik chcę móc zresetować hasło, gdy je zapomnę.
**Kryteria akceptacji:**
- Link "Zapomniałem hasła" na stronie logowania
- Formularz z polem email do resetu hasła
- Wysłanie linku resetującego na email
- Formularz ustawienia nowego hasła po kliknięciu w link
- Potwierdzenie zmiany hasła

### US-004: Tryb demo
**Opis:** Jako potencjalny użytkownik chcę przetestować aplikację bez rejestracji.
**Kryteria akceptacji:**
- Przycisk "Wypróbuj demo" na stronie głównej
- Dostęp do wszystkich funkcji z przykładowymi danymi
- Predefiniowana "lodówka" z produktami
- Przykładowy jadłospis tygodniowy
- Możliwość przejścia do rejestracji z poziomu demo
- Powinno dzialac bez logowania

### US-005: Dodawanie produktu do lodówki
**Opis:** Jako użytkownik chcę dodać produkt do mojej lodówki, aby móc go uwzględnić w planowaniu posiłków.
**Kryteria akceptacji:**
- Formularz z polami: nazwa, kategoria, data ważności, jednostka, ilość
- Lista rozwijana z kategoriami: nabiał, mięso, pieczywo, warzywa, owoce
- Walidacja wszystkich wymaganych pól
- Potwierdzenie dodania produktu
- Aktualizacja listy produktów po dodaniu

### US-006: Przeglądanie produktów w lodówce
**Opis:** Jako użytkownik chcę przeglądać moje produkty, aby wiedzieć, co mam dostępne.
**Kryteria akceptacji:**
- Lista wszystkich produktów z podstawowymi informacjami
- Grupowanie produktów po kategoriach
- Sortowanie po dacie ważności
- Wyróżnienie produktów bliskich wygaśnięcia
- Wyszukiwanie produktów po nazwie

### US-007: Edycja produktu
**Opis:** Jako użytkownik chcę edytować dane produktu, aby skorygować błędy lub zaktualizować informacje.
**Kryteria akceptacji:**
- Przycisk edycji przy każdym produkcie
- Formularz edycji z obecnymi danymi produktu
- Możliwość zmiany wszystkich pól
- Walidacja zmiennych danych
- Potwierdzenie zapisania zmian

### US-008: Usuwanie produktu
**Opis:** Jako użytkownik chcę usunąć produkt z lodówki, gdy go już nie mam.
**Kryteria akceptacji:**
- Przycisk usuwania przy każdym produkcie
- Potwierdzenie usunięcia (modal/alert)
- Natychmiastowe usunięcie z listy
- Komunikat o pomyślnym usunięciu
- Możliwość cofnięcia akcji (opcjonalne)

### US-009: Wyszukiwanie przepisów po składnikach
**Opis:** Jako użytkownik chcę znaleźć przepisy na podstawie produktów, które mam w lodówce.
**Kryteria akceptacji:**
- Automatyczne dopasowanie przepisów do posiadanych produktów
- Podział wyników na poziomy dopasowania: idealny, prawie idealny, wymaga dokupienia
- Wyświetlenie brakujących składników dla każdego przepisu
- Możliwość sortowania po poziomie dopasowania
- Informacja o liczbie dostępnych przepisów

### US-010: Filtrowanie przepisów
**Opis:** Jako użytkownik chcę filtrować przepisy po kategorii posiłku i rodzaju białka, aby znaleźć odpowiedni przepis.
**Kryteria akceptacji:**
- Filtry po kategorii: śniadanie, obiad, kolacja, przekąska
- Filtry po rodzaju białka: ryba, drób, czerwone mięso, vege
- Możliwość kombinowania filtrów
- Liczba wyników po zastosowaniu filtrów
- Łatwe resetowanie filtrów

### US-011: Przeglądanie szczegółów przepisu
**Opis:** Jako użytkownik chcę zobaczyć szczegóły przepisu, aby móc go przygotować.
**Kryteria akceptacji:**
- Pełny opis przepisu z listą składników
- Podział na składniki kluczowe i opcjonalne
- Czas przygotowania i liczba porcji
- Wartości odżywcze
- Krok po kroku instrukcje
- Oznaczenie dostępności składników

### US-012: Oznaczanie przepisu jako ugotowany
**Opis:** Jako użytkownik chcę oznaczyć przepis jako ugotowany, aby automatycznie zaktualizować stan moich produktów.
**Kryteria akceptacji:**
- Przycisk "Ugotowane" w szczegółach przepisu
- Automatyczne odjęcie składników z lodówki zgodnie z przepisem
- Możliwość wyboru liczby porcji (skalowanie składników)
- Potwierdzenie aktualizacji produktów
- Obsługa sytuacji, gdy brakuje składników

### US-013: Ustawianie preferencji żywieniowych
**Opis:** Jako użytkownik chcę ustawić swoje preferencje żywieniowe, aby aplikacja lepiej dopasowywała przepisy.
**Kryteria akceptacji:**
- Panel ustawień preferencji
- Suwaki/pola dla: max obiadów mięsnych, min/max obiadów rybnych, obiadów vege
- Ustawienie liczby śniadań/kolacji z jajkami
- Wybór proporcji śniadań słodkich vs słonych
- Ustawienie dziennej kaloryczności
- Zapisanie preferencji z potwierdzeniem

### US-014: Generowanie tygodniowego jadłospisu
**Opis:** Jako użytkownik chcę wygenerować jadłospis na cały tydzień na podstawie moich produktów i preferencji.
**Kryteria akceptacji:**
- Przycisk generowania jadłospisu
- Plan 7 dni po 5 posiłków dziennie
- Uwzględnienie preferencji żywieniowych
- Wykorzystanie dostępnych produktów
- Zróżnicowanie posiłków w tygodniu
- Wyświetlenie listy produktów do dokupienia

### US-015: Przeglądanie jadłospisu tygodniowego
**Opis:** Jako użytkownik chcę przeglądać mój jadłospis tygodniowy, aby wiedzieć, co mam jeść każdego dnia.
**Kryteria akceptacji:**
- Przejrzysty widok tygodnia z podziałem na dni
- 5 posiłków na dzień: śniadanie, drugie śniadanie, obiad, podwieczorek, kolacja
- Podstawowe informacje o każdym posiłku: nazwa, czas, kalorie
- Oznaczenie dostępności składników
- Możliwość przejścia do szczegółów przepisu

### US-016: Wylogowanie
**Opis:** Jako użytkownik chcę móc się wylogować z aplikacji, aby zabezpieczyć moje dane.
**Kryteria akceptacji:**
- Przycisk wylogowania dostępny w nawigacji
- Potwierdzenie wylogowania
- Przekierowanie do strony logowania
- Wyczyszczenie sesji użytkownika
- Brak możliwości powrotu bez ponownego logowania

### US-017: Nawigacja między sekcjami
**Opis:** Jako użytkownik chcę łatwo nawigować między głównymi sekcjami aplikacji.
**Kryteria akceptacji:**
- Główne menu z sekcjami: Lodówka, Przepisy, Plan tygodnia
- Aktywna sekcja wyraźnie oznaczona
- Szybki dostęp do wszystkich funkcji
- Responsywna nawigacja na urządzeniach mobilnych
- Logo/nazwa aplikacji linkująca do strony głównej

### US-018: Przeglądanie przepisów w bazie
**Opis:** Jako użytkownik chcę przeglądać wszystkie dostępne przepisy w bazie, aby poznać możliwości aplikacji.
**Kryteria akceptacji:**
- Lista wszystkich przepisów w bazie
- Podstawowe informacje: nazwa, kategoria, czas, kalorie
- Możliwość sortowania i filtrowania
- Wyszukiwanie po nazwie przepisu
- Podgląd obrazka przepisu (jeśli dostępny)

### US-019: Obsługa błędów i komunikatów
**Opis:** Jako użytkownik chcę otrzymywać jasne komunikaty o błędach i sukcesach, aby rozumieć stan aplikacji.
**Kryteria akceptacji:**
- Komunikaty błędów z jasnymi opisami problemu
- Komunikaty sukcesu po pomyślnych operacjach
- Walidacja formularzy w czasie rzeczywistym
- Obsługa błędów sieci i serwera
- Przyjazne komunikaty dla użytkownika

### US-020: Responsywność aplikacji
**Opis:** Jako użytkownik chcę korzystać z aplikacji na różnych urządzeniach z wygodnym interfejsem.
**Kryteria akceptacji:**
- Aplikacja działa poprawnie na desktopie, tablecie i telefonie
- Menu adaptuje się do rozmiaru ekranu
- Wszystkie funkcje dostępne na urządzeniach mobilnych
- Szybkie ładowanie na wolniejszych połączeniach
- Intuicyjny interfejs na dotyk

## 6. Metryki sukcesu

### 6.1 Kluczowe wskaźniki efektywności (KPI)

#### Adopcja funkcji planowania
- **Metryka:** Procent zarejestrowanych użytkowników, którzy wygenerowali co najmniej 1 tygodniowy jadłospis
- **Cel:** 70%
- **Sposób pomiaru:** Event tracking w analityce ("weekly_plan_generated")

#### Zaangażowanie w zarządzanie lodówką
- **Metryka:** Średnia liczba produktów w lodówce na aktywnego użytkownika
- **Cel:** ≥ 10 produktów
- **Sposób pomiaru:** Analiza bazy danych - zliczanie produktów przypisanych do aktywnych użytkowników

#### Bogactwo bazy przepisów
- **Metryka:** Liczba przepisów na kategorię (śniadanie, obiad, kolacja, przekąski)
- **Cel:** Minimum 10 przepisów na kategorię
- **Sposób pomiaru:** Monitoring seedowej bazy przepisów

### 6.2 Dodatkowe metryki

#### Jakość dopasowania AI
- **Metryka:** Stosunek liczby użyć przycisku "Ugotowane" do liczby wygenerowanych rekomendacji
- **Cel:** ≥ 20%
- **Sposób pomiaru:** Tracking eventów w aplikacji

#### Retencja użytkowników
- **Metryka:** Procent użytkowników powracających do aplikacji w ciągu 7 dni
- **Cel:** ≥ 40%
- **Sposób pomiaru:** Analiza logów aktywności użytkowników

#### Konwersja z demo do rejestracji
- **Metryka:** Procent użytkowników demo, którzy dokonali rejestracji
- **Cel:** ≥ 15%
- **Sposób pomiaru:** Tracking ścieżki użytkownika z demo do rejestracji

### 6.3 Metryki techniczne

#### Wydajność aplikacji
- **Metryka:** Czas ładowania głównych stron aplikacji
- **Cel:** < 3 sekundy
- **Sposób pomiaru:** Monitoring wydajności webowej

#### Dostępność aplikacji
- **Metryka:** Uptime aplikacji
- **Cel:** ≥ 99%
- **Sposób pomiaru:** Monitoring infrastruktury

#### Jakość kodu
- **Metryka:** Pokrycie testami
- **Cel:** ≥ 80%
- **Sposób pomiaru:** Narzędzia do analizy pokrycia kodu

### 6.4 Metodyka pomiaru

#### Narzędzia analityczne
- Google Analytics lub podobne do trackingu behawiorów użytkowników
- Monitoring aplikacji (np. Sentry) do śledzenia błędów
- Logi aplikacji do analizy użycia funkcji

#### Częstotliwość raportowania
- Metryki KPI: tygodniowo
- Metryki techniczne: dziennie
- Analiza trendu: miesięcznie

#### Działania naprawcze
- Jeśli metryka adopcji jadłospisu < 50% po 4 tygodniach - analiza UX i uproszczenie procesu
- Jeśli średnia liczba produktów < 7 - dodanie funkcji importu lub motywacyjnych elementów
- Jeśli retencja < 30% - analiza onboardingu i value proposition

### 6.5 Definicja sukcesu MVP
MVP będzie uznane za sukces, jeśli po 8 tygodniach od uruchomienia:
- Co najmniej 70% aktywnych użytkowników wygenerowało jadłospis tygodniowy
- Średnia liczba produktów w lodówce wynosi ≥ 10
- Aplikacja ma stabilną bazę przepisów (min. 10 na kategorię)
- Wskaźnik zadowolenia użytkowników ≥ 7/10 (na podstawie ankiet)
