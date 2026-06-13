# 🌡️ PharmaGuard: IoT & Blockchain-Based Cold Chain Monitoring

**PharmaGuard** è un sistema integrato **Edge-to-Blockchain** sviluppato come progetto d'esame per i corsi di **Internet of Things (IoT)** e **Sicurezza dei Dati / Blockchain**.

Il progetto mira a risolvere una delle criticità più sentite nella logistica farmaceutica (la *Cold Chain*): la centralizzazione dei dati, che rappresenta un *Single Point of Failure*, e la vulnerabilità alla manomissione dei registri termici tradizionali. Ispirandosi a modelli di sicurezza enterprise come *MedicalAccess*, PharmaGuard introduce un'architettura ibrida in cui la cattura fisica del dato e la governance logica sono nettamente separate per garantire massime performance e immutabilità del dato.

---

## 🏗️ Architettura del Sistema

Il sistema adotta un approccio **Ibrido (On-Chain / Off-Chain)** per bilanciare privacy, scalabilità e costi di computazione (Gas):

* **Livello Edge (IoT):** Un microcontrollore **ESP32** accoppiato a un sensore **DHT22** effettua il campionamento in tempo reale della temperatura ambientale all'interno dei moduli di stoccaggio farmaceutico.
* **Livello Off-Chain (Performance):** Un server **Node.js** agisce come Gateway intermedio. Riceve i dati dall'hardware IoT tramite protocollo HTTP POST, gestisce l'aritmetica a virgola fissa per ovviare all'assenza di decimali nativi in Solidity, e prepara le transazioni crittografiche.
* **Livello On-Chain (Governance):** Uno **Smart Contract** sviluppato in Solidity (distribuito su rete locale **Ganache**) gestisce la whitelist degli attori autorizzati, la registrazione dei lotti e la validazione autonoma delle soglie di sicurezza.

---

## 🛡️ Funzionalità di Sicurezza & Mitigazione

Basandosi sui principi di sicurezza dei dati sanitari, il sistema implementa:

* **Passwordless Authentication:** L'accesso e la gestione dei lotti avvengono esclusivamente tramite firme digitali generate da Wallet crittografici (**MetaMask**), eliminando i vettori d'attacco legati al Phishing o al furto di credenziali classiche.
* **Blockchain Verification & Instant Revocation:** Ogni transazione subisce un *Blockchain Check* immediato. Se un amministratore revoca l'autorizzazione a un medico o a un gateway rimuovendo l'identità (Hash) dallo Smart Contract, qualsiasi operazione successiva fallisce istantaneamente.
* **Immutabilità degli Stati Critici:** Al superamento della soglia termica configurata dinamicamente per uno specifico farmaco (es. >25°C), lo Smart Contract altera in modo irreversibile lo stato del lotto in `isSafe = false`, creando una prova digitale non ripudiabile del danno biologico.
* **Log Tamper-Proofing (Batch Pinning):** I log storici e voluminosi delle temperature vengono mantenuti Off-Chain, mentre l'ancoraggio (*Pinning*) periodico del loro Hash su Blockchain ne garantisce l'impossibilità di alterazione postuma.

---

## 🛠️ Tech Stack

* **Hardware:** ESP32, Sensore DHT22.
* **Backend & Gateway:** Node.js, Express, Web3.js.
* **Blockchain & Smart Contracts:** Solidity, Truffle, Ganache, MetaMask.
* **Frontend Dashboard:** HTML5, CSS3 (Modern Tech-Medical UI), Bootstrap, jQuery.

---

## 🚀 Come Avviare il Progetto Localmente

### 1. Prerequisiti

Assicurati di avere installato:

* Node.js
* Ganache
* L'estensione MetaMask sul tuo browser.

### 2. Configurazione Blockchain

1. Avvia un'istanza locale su Ganache (porta standard `7545`).
2. Compila e distribuisci lo Smart Contract tramite terminale:
```bash
truffle compile
truffle migrate --reset

```


3. Collega MetaMask a Ganache importando una delle chiavi private fornite dal network locale.

### 3. Avvio del Gateway Node.js

Naviga nella cartella del server e avvia il bridge IoT-Blockchain da terminale:

```bash
npm install
node gateway.js

```

### 4. Configurazione Hardware (ESP32)

1. Apri il file `.ino` con l'IDE di Arduino.
2. Configura le tue credenziali Wi-Fi (`ssid` e `password`) e l'indirizzo IP locale su cui è in esecuzione il Gateway Node.js.
3. Carica il codice sulla scheda ESP32.

### 5. Avvio della Web Dashboard

Avvia il server di sviluppo frontend (es. tramite `npm run dev` o estensioni come *Live Server*) e apri la dashboard nel browser per monitorare lo stato dei lotti in tempo reale.

---

### 🎓 Nota Accademica

*Questo progetto è stato sviluppato per dimostrare l'efficacia delle architetture Zero-Trust applicate alla supply-chain medica, combinando l'affidabilità dei sistemi embedded IoT con la decentralizzazione e l'integrità crittografica dei registri distribuiti Blockchain.*
