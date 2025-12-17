📋 PROMPT dla rozszerzenia jednostek miary

# Rozszerzenie systemu jednostek miary w aplikacji FridgePick

## Cel zadania
Dodanie nowych jednostek miary (kg, ml, dkg) do istniejącego systemu w aplikacji FridgePick oraz
poprawa UX wyboru jednostek.

## Aktualna sytuacja
- Aplikacja ma 3 jednostki: gramy (g), litry (l), sztuki (szt)
- Jednostki są zdefiniowane w enum `unit_type` w bazie danych
- Frontend ma UnitSelector komponent z dropdown
- Quantity input ma dynamiczny step na podstawie wybranej jednostki

## Zadania do wykonania

### 1. Rozszerzenie bazy danych
- Dodaj nowe wartości do enum `unit_type`: 'kg', 'ml', 'dkg'
- Zaktualizuj istniejące dane jeśli potrzebne (migration)

### 2. Aktualizacja typów TypeScript
W pliku `/src/types/index.ts`:
- Rozszerz `DatabaseEnums['unit_type']` o nowe jednostki
- Zaktualizuj `UNIT_TYPES` array

### 3. Poprawa UX wyboru jednostek
W `/src/components/product-form/UnitSelector.tsx`:
- Pogrupuj jednostki logicznie (masa: g, dkg, kg; objętość: ml, l; ilość: szt)
- Dodaj kategoryzację z optgroup lub wizualne separatory
- Zaktualizuj `unitLabels` o nowe opcje

### 4. Inteligentny step w quantity
W `/src/components/product-form/ProductForm.tsx` funkcji `getQuantitySettings()`:
- kg: step="0.1", placeholder="2.5" (np. 2.5kg)
- ml: step="50", placeholder="250" (np. 250ml)
- dkg: step="1", placeholder="25" (np. 25dkg)

### 5. Sugestie kontekstowe
Dodaj logikę sugerowania odpowiedniej jednostki na podstawie kategorii produktu:
- Produkty mleczne → domyślnie ml/l
- Mięso → domyślnie g/kg
- Warzywa/owoce → domyślnie g/kg
- Przyprawy → domyślnie g/dkg

### 6. Walidacja i konwersje
- Dodaj walidację rozsądnych wartości dla każdej jednostki
- Opcjonalnie: automatyczna konwersja (np. 1500g → 1.5kg)
- Prevent nonsensical combinations (np. 0.001 sztuki)

### 7. Aktualizacja dokumentacji
- Zaktualizuj wskazówki w formularzu
- Dodaj tooltips z przykładami dla każdej jednostki

## Pliki do modyfikacji
1. `/src/types/index.ts` - typy i enum
2. `/src/components/product-form/UnitSelector.tsx` - UI selector
3. `/src/components/product-form/ProductForm.tsx` - logika step/placeholder
4. `/src/hooks/useProductForm.ts` - walidacja (jeśli potrzebne)
5. Migracja bazy danych (SQL)

## Oczekiwany rezultat
- Intuicyjny wybór jednostek z grupowaniem
- Sensowne incrementy przy używaniu +/- w quantity input
- Lepsze UX z kontekstowymi sugestiami
- Zachowanie wstecznej kompatybilności z istniejącymi produktami

## Dodatkowe możliwości (opcjonalne)
- Smart conversion między jednostkami tej samej kategorii
- Ikony obok jednostek dla lepszej identyfikacji
- Zapamiętywanie ostatnio używanych jednostek per kategoria
