#  <img width="30" height="30" alt="image" src="https://github.com/user-attachments/assets/17871390-bbca-4e8a-93a8-6d5dd8f30b2c" />   Weather Prediction & Visualization App

Aplikacija omogoča **prikaz trenutnih vremenskih podatkov**, **pregled zgodovine meritev**, ter **napoved možnosti dežja** na osnovi modela strojnega učenja.  

## Tehnična arhitektura

- **Frontend:** [Angular](https://angular.io/) (TypeScript)  
  Uporabniški vmesnik za prikaz podatkov ter interakcijo z uporabnikom.  
  Komunicira tako s Flask kot s FastAPI storitvami.

- **IoT Backend (Raspberry Pi):** [Flask](https://flask.palletsprojects.com/) (Python)  -Ni prisoten v repozitoriju. 
  Modul na Raspberry Pi, ki skrbi za zajem podatkov iz senzorjev in ponuja API endpointe za dostop do teh podatkov.  
  Podatke posreduje neposredno Angular aplikaciji.

- **ML Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Python)  
  Strežnik za obdelavo podatkov in izvajanje modelov strojnega učenja.  
  Angular aplikacija se nanj povezuje za analitične funkcionalnosti.

- **Podatkovna baza:** [Supabase](https://supabase.com/)  
  Shramba podatkov in avtentikacija uporabnikov.


## <img width="30" height="30" alt="image" src="https://github.com/user-attachments/assets/eadc9e68-d6e0-4806-935b-7ad3e8cd8a40" />   Kaj aplikacija omogoča

- **Trenutni vremenski podatki**:
  - Temperatura, relativna vlažnost, zračni tlak, hitrost in smer vetra
  - Prikaz časovnega žiga zadnje meritve
  - Ekstremi in osnovna statistika
  - Kamera z uporabo HLS video pretoka

- **Zgodovinski podatki**:
  - Grafični prikaz po urah, dnevih, tednih
  - Filtriranje po parametrih
  - Interaktivni koledarski vmesnik za izbor obdobja

- **Napoved vremena**:
  - Model XGBoost napove možnost dežja na osnovi zadnjih meritev

- **Personalizacija**:
  - Preklop med temno in svetlo temo
  - Podpora slovenščini in angleščini (i18n)
  - Shramba nastavitev uporabnika (tema, jezik)

- **Administracija**:
  - Izvoz podatkov v CSV ali JSON
  - Prijava in urejanje senzorskih podatkov

---

## <img width="30" height="30" alt="image" src="https://github.com/user-attachments/assets/8a286662-22ec-4ef2-bfcf-b44d14402455" />   Zagon aplikacije

### 1. Backend (FastAPI)
1. Namesti Python odvisnosti:
    ```bash
    npm install
2. Zagon aplikacije v produkcijskem načinu:
    ```bash
    ng serve --configuration=production











