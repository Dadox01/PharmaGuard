App = {
    web3Provider: null,
    contracts: {},

    init: async function() { return await App.initWeb3(); },

    initWeb3: async function() {
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            await window.ethereum.request({ method: "eth_requestAccounts" }); // Firma tramite Wallet
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);
        return App.initContract();
    },

    initContract: function() {
        $.getJSON('PharmaChain.json', function(data) {
            App.contracts.PharmaChain = TruffleContract(data);
            App.contracts.PharmaChain.setProvider(App.web3Provider);
            App.bindEvents();
            App.render();
            setInterval(App.render, 5000); // Polling asincrono
        });
    },

    bindEvents: function() {
        $(document).on('click', '.btn-register', App.handleRegister);
    },

    render: async function() {
        const instance = await App.contracts.PharmaChain.deployed();
        const lottiRow = $('#lottiRow');
        const lottoTemplate = $('#lottoTemplate');
        lottiRow.empty();

        const now = Math.floor(Date.now() / 1000); // Tempo Unix attuale

        for (var i = 0; i < 16; i++) {
            const batch = await instance.batches(i);
            const name = batch[0];
            const manufacturer = batch[1];
            const isSafe = batch[2];
            const tempRaw = parseInt(batch[3]);
            const maxTemp = parseInt(batch[4]);
            const lastUpdate = parseInt(batch[5]);

            lottoTemplate.find('.drug-id').text(i);
            lottoTemplate.find('.btn-register').attr('data-id', i);

            if (manufacturer !== '0x0000000000000000000000000000000000000000') {
                lottoTemplate.find('.drug-name').text(name);
                
                // LOGICA DI CONTROLLO STATO (IoT vs Blockchain)
                if (now - lastUpdate > 30) { 
                    // Caso 1: Connessione persa (Timeout > 30s)
                    lottoTemplate.find('.drug-temp').text("TIMEOUT").css('color', 'gray');
                    lottoTemplate.find('.drug-status').text("⚠️ CONNESSIONE PERSA").attr('class', 'drug-status text-secondary font-weight-bold');
                } else if (tempRaw === -999) {
                    // Caso 2: Sensore collegato ma con errore hardware (NaN)
                    lottoTemplate.find('.drug-temp').text("ERR").css('color', 'orange');
                    lottoTemplate.find('.drug-status').text("⚠️ ATTESA DATI").attr('class', 'drug-status text-warning');
                } else {
                    // Caso 3: Funzionamento nominale
                    lottoTemplate.find('.drug-temp').text(tempRaw + " ");
                    const statusText = isSafe ? "✅ SICURO" : "❌ COMPROMESSO";
                    const statusClass = isSafe ? 'drug-status text-success' : 'drug-status text-danger font-weight-bold';
                    lottoTemplate.find('.drug-status').text(statusText).attr('class', statusClass);
                    lottoTemplate.find('.drug-temp').css('color', tempRaw > maxTemp ? 'red' : 'black');
                }
                
                lottoTemplate.find('.drug-threshold').text("Soglia: " + maxTemp + "°C");
                lottoTemplate.find('.btn-register').hide();
            } else {
                lottoTemplate.find('.drug-name').text("Slot Libero");
                lottoTemplate.find('.drug-status').text("Disponibile").attr('class', 'drug-status text-muted');
                lottoTemplate.find('.drug-temp').text("--");
                lottoTemplate.find('.drug-threshold').text("");
                lottoTemplate.find('.btn-register').show();
            }
            lottiRow.append(lottoTemplate.html());
        }
    },

    handleRegister: async function(event) {
        const id = $(event.target).data('id');
        const name = prompt("Nome farmaco:");
        const threshold = prompt("Soglia massima (°C):", "25");
        if (!name || !threshold) return;

        const accounts = await web3.eth.getAccounts();
        const instance = await App.contracts.PharmaChain.deployed();
        // Registrazione del lotto
        await instance.registerBatch(id, name, parseInt(threshold), { from: accounts[0] });
        App.render();
    }
};

$(() => $(window).on('load', App.init));