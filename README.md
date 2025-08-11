# 🌦 Weather Prediction & Visualization App

Aplikacija omogoča **prikaz trenutnih vremenskih podatkov**, **pregled zgodovine meritev**, ter **napoved možnosti dežja** na osnovi modela strojnega učenja.  
Sestavljena je iz **FastAPI backend-a** (Python) in **Angular frontend-a** (TypeScript).

---

## 📖 Kaj aplikacija omogoča

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

## ▶️ Zagon aplikacije

### 1. Backend (FastAPI)
1. Namesti Python odvisnosti:
    ```bash
    npm install
2. Zagon aplikacije v produkcijskem načinu:
    ```bash
    ng serve --configuration=production

