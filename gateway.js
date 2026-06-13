const Web3 = require('web3');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

// --- CONFIGURAZIONE ---
const GANACHE_URL = 'http://127.0.0.1:7545';
const PORT = 3005;

// 1. Connessione a Ganache
const web3 = new Web3(GANACHE_URL);

// 2. Caricamento del Contratto
let pharmaContract;
let networkData;

try {
    const contractJSON = JSON.parse(fs.readFileSync('./build/contracts/PharmaChain.json', 'utf8'));
    networkData = contractJSON.networks["5777"] || contractJSON.networks["1337"];

    if (!networkData) {
        throw new Error("Contratto non trovato");
    }

    pharmaContract = new web3.eth.Contract(contractJSON.abi, networkData.address);
    console.log(`Registro Immutabile agganciato: ${networkData.address}`);
} catch (error) {
    console.error("Errore caricamento contratto:", error.message);
    process.exit(1);
}

// 3. Endpoint POST per l'ESP32
app.post('/updateTemp', async (req, res) => {
    const { batchId, temp } = req.body;

    console.log(`Ricezione IoT -> Lotto: ${batchId} | Temperatura: ${temp}°C`);

    try {
        // Recupero degli account: l'identità deve essere presente nella whitelist del contratto
        const accounts = await web3.eth.getAccounts();
        
        // Se temp è -999 (Errore Sensore), viene mantenuto come valore sentinella
        const temperatureToSend = Math.round(temp);

        // La transazione fallirà se accounts[0] non è il authorizedGateway (Blockchain Check) 
        await pharmaContract.methods.reportTemperature(batchId, temperatureToSend).send({
            from: accounts[0],
            gas: 300000
        });

        console.log("🔗 Batch Pinning: Stato salvato immutabilmente in Blockchain.");
        res.status(200).json({ success: true });

    } catch (error) {
        // Mitigazione Furto Credenziali e Accesso non autorizzato 
        console.error("Violazione Sicurezza o Fallimento Blockchain:", error.message);
        res.status(500).json({ success: false, error: "Accesso negato o errore di rete" });
    }
});

// 4. Avvio Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(`GATEWAY IoT PHARMAGUARD ATTIVO`);
    console.log(`Server Node.js pronto`);
    console.log(`=========================================`);
});