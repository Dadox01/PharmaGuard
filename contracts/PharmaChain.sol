// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract PharmaChain {
    struct Batch {
        string name;
        address manufacturer;
        bool isSafe;      
        int256 lastTemp;  
        int256 maxTemp; 
        uint256 lastUpdate; // Timestamp dell'ultima ricezione
    }

    Batch[16] public batches;
    address public admin;
    address public authorizedGateway; // Whitelist per la sicurezza [cite: 28]

    event TemperatureUpdated(uint256 id, int256 temp, bool isSafe);

    constructor() {
        admin = msg.sender;
        authorizedGateway = msg.sender; 
    }

    function setGateway(address _newGateway) public {
        require(msg.sender == admin, "Solo l'admin puo gestire la whitelist");
        authorizedGateway = _newGateway;
    }

    function registerBatch(uint256 _id, string memory _name, int256 _maxTemp) public {
        require(_id < 16, "ID fuori range");
        batches[_id].name = _name;
        batches[_id].manufacturer = msg.sender;
        batches[_id].isSafe = true; 
        batches[_id].maxTemp = _maxTemp;
        batches[_id].lastTemp = -999; // Stato OFFLINE iniziale
        batches[_id].lastUpdate = block.timestamp; 
    }

    function reportTemperature(uint256 _id, int256 _temp) public {
        // Verifica identita autorizzata [cite: 47]
        require(msg.sender == authorizedGateway, "Accesso non autorizzato!");
        
        batches[_id].lastTemp = _temp;
        batches[_id].lastUpdate = block.timestamp; // Aggiornamento del "battito cardiaco"

        if (_temp != -999 && _temp > batches[_id].maxTemp) {
            batches[_id].isSafe = false;
        }

        emit TemperatureUpdated(_id, _temp, batches[_id].isSafe);
    }
}