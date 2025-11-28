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
