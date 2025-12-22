Jesteś doświadczonym programistą frontend.

Korzystając z opisu projektu @.ai/prd.md

oraz z reguł testowania: @.ai/rules/playwright.md

oraz konta testowego @.env.test

Tech stack: @.ai/tech-stack.md

diagramu komponentów: @.ai/mermaid-diagram-auth.mdc
diagramu komponentów: @.ai/mermaid-diagram-journey.mdc
diagramu komponentów: @.ai/mermaid-diagram-ui.mdc

opisu ui: @.ai/ui-plan.md

zaimplementuj test e2e logowania, dodawania produktu i wyswietlania listy produktow 

wez pod uwage te wskazowki:
Optymalizacja procesu logowania

W pierwszym podejściu do implementacji testów E2E, każdy test wymagający logowania może korzystać z danych użytkownika testowego, dostępnego w bazie testowej. Kod może się tymczasowo powielać, a ty dzięki temu możesz się skupić na implementacji docelowych scenariuszy.

W kolejnym kroku możesz wdrożyć optymalizację - o ile na starcie logowanie może być stałym elementem każdego testu, to w dużej skali, kiedy złożoność projektu wystrzeli w górę, będziesz chciał się tego kroku pozbyć i używać:

a) sesji generowanej raz i zapisanej do ponownego reużycia

b) logowania poprzez API, co pozwoli oszczędzić czas na nawigację po UI

Pozostawiamy tę optymalizację dla chętnych - w przystępny sposób opisuje je dokumentacja:



Teardown

Problem, z którym zmierzymy się na samym końcu, to czyszczenie tabel w których znajdują się dane utworzone w trakcie testów.

Zrealizujemy to poprzez tzw. teardown, czyli mechanizm “usuwania śladów” jakie pozostawiają po sobie nasze testy e2e. Na poniższym filmie zobaczysz jak model AI wspieramy rzeczywistą dokumentacją w formacie Markdown, którą pobieramy z otwartego repozytorium.
