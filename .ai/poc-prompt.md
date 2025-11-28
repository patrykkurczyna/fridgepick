# Prompt dla Generatora PoC - FridgePick: Zarzdzanie Katalogiem Produktów

## Instrukcje dla Generatora

**WA{NE: Przed rozpoczciem implementacji MUSISZ przedstawi szczegóBowy plan pracy i uzyska moj akceptacj. NIE ROZPOCZYNAJ implementacji bez mojego wyraznego potwierdzenia planu.**

## Cel PoC

Stworzenie minimalnego, funkcjonalnego proof of concept dla **wyBcznie funkcjonalno[ci zarzdzania katalogiem produktów** aplikacji FridgePick. PoC ma zweryfikowa podstawowe operacje CRUD bez dodatkowych funkcji.

## Zakres Funkcjonalny (TYLKO TO!)

###  CO IMPLEMENTOWA

**Zarzdzanie produktami - podstawowy CRUD:**
1. **Dodawanie produktu** - formularz z polami:
   - nazwa (string, wymagane)
   - kategoria (enum: nabiaB, miso, pieczywo, warzywa, owoce)
   - data wa|no[ci (date)
   - jednostka (enum: kg, g, l, ml, sztuki)
   - ilo[ (number)

2. **Przegldanie produktów** - lista produktów z:
   - Wszystkimi polami produktu
   - Grupowaniem po kategoriach
   - Sortowaniem po dacie wa|no[ci
   - Podstawowym filtrowaniem/wyszukiwaniem

3. **Edycja produktu** - mo|liwo[ modyfikacji wszystkich pól

4. **Usuwanie produktu** - z potwierdzeniem

### L CO WYKLUCZY Z PoC

- System autoryzacji/logowania
- Funkcje AI i dopasowywanie przepisów  
- Planowanie jadBospisów
- Przepisy i ich zarzdzanie
- Preferencje u|ytkownika
- Tryb demo
- Zaawansowane filtrowanie
- Powiadomienia o wygasajcych produktach
- Import/eksport danych
- Responsywno[ mobilna (tylko desktop)

## Stack Technologiczny dla PoC

**U|yj uproszczonego stacku:**

```
Frontend: Next.js 14 + TypeScript + Tailwind CSS + Shadcn/ui
Database: SQLite (lokalna, bez zewntrznych serwisów)
ORM: Prisma
Styling: Podstawowe komponenty Shadcn/ui (Button, Input, Table, Card)
State Management: Brak - u|yj React hooks
```

**Uzasadnienie wyboru:**
- SQLite eliminuje potrzeb konfiguracji bazy danych
- Brak zewntrznych serwisów = szybsze uruchomienie
- Minimalna konfiguracja infrastruktury
- Fokus na funkcjonalno[, nie na architektur

## Wymagania Techniczne

### Struktura Bazy Danych
```sql
Product {
  id          Int      @id @default(autoincrement())
  name        String
  category    Category
  expiryDate  DateTime
  unit        Unit  
  quantity    Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Category {
  DAIRY      // nabiaB
  MEAT       // miso  
  BREAD      // pieczywo
  VEGETABLES // warzywa
  FRUITS     // owoce
}

enum Unit {
  KG    // kilogramy
  G     // gramy
  L     // litry
  ML    // mililitry
  PCS   // sztuki
}
```

### UI Requirements
- **Minimalistyczny design** - biaBe tBo, proste formularze
- **Jedno-stronowa aplikacja** - wszystkie operacje na jednej stronie
- **Podstawowa walidacja** - required fields, data types
- **Feedback u|ytkownika** - success/error messages
- **Bez animacji** - statyczne UI dla szybko[ci developmentu

## Plan Pracy - DO AKCEPTACJI

**MUSISZ przedstawi plan zawierajcy:**

1. **Struktura projektu** - jakie foldery i pliki utworzysz
2. **Kolejno[ implementacji** - krok po kroku plan pracy
3. **Komponenty React** - lista gBównych komponentów do stworzenia
4. **API endpoints** - jakie endpointy API bd potrzebne
5. **Schema bazy danych** - potwierdzona struktura Prisma
6. **Kryteria ukoDczenia** - jak zweryfikowa, |e PoC dziaBa
7. **Szacowany czas implementacji** - realistyczna ocena czasu

## Kryteria Akceptacji PoC

PoC bdzie uznane za ukoDczone gdy:

- [x] Mo|na doda nowy produkt przez formularz
- [x] Lista produktów wy[wietla wszystkie dodane produkty  
- [x] Mo|na edytowa istniejcy produkt
- [x] Mo|na usun produkt z potwierdzeniem
- [x] Podstawowe grupowanie po kategoriach dziaBa
- [x] Sortowanie po dacie wa|no[ci funkcjonuje
- [x] Walidacja formularzy zapobiega niepoprawnym danym
- [x] Aplikacja uruchamia si lokalnie bez bBdów
- [x] Dane persistuj midzy sesjami (zapisane w SQLite)

## Ograniczenia i ZaBo|enia

1. **Nie optymalizuj przedwcze[nie** - priorytet na dziaBajc funkcjonalno[
2. **U|yj domy[lnych konfiguracji** - minimalna customizacja
3. **Jeden u|ytkownik** - brak separacji danych midzy u|ytkownikami  
4. **Lokalne deployment** - tylko `npm run dev`
5. **Podstawowy error handling** - try/catch bez zaawansowanej obsBugi
6. **Brak testów** - w PoC skupiamy si na manual testing

## Proces Rozpoczcia

1. **PRZEDSTAW PLAN** zgodnie z sekcj "Plan Pracy - DO AKCEPTACJI"
2. **CZEKAJ NA AKCEPTACJ** - nie rozpoczynaj implementacji bez potwierdzenia
3. **IMPLEMENTUJ WEDAUG PLANU** - trzymaj si uzgodnionego zakresu
4. **DOKUMENTUJ PROBLEMY** - je[li napotkasz blokery, zgBo[ je
5. **DOSTARCZAJ INCREMENTAL UPDATES** - pokazuj postp co 2-3 komponenty

**Pamitaj: Celem jest szybka weryfikacja podstawowej funkcjonalno[ci, nie stworzenie production-ready aplikacji.**