document.addEventListener('DOMContentLoaded', () => {
    let selectedPlayerCount = null;
    const selectedSpecials = new Set();
    let playerNames = [];

    // Check if there's saved history
    checkHistory();

    // Player count selection
    const playerButtons = document.querySelectorAll('.btn-player');
    playerButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            playerButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedPlayerCount = parseInt(btn.dataset.players);
            generatePlayerNameInputs();
            updateGameInfo();
            validateStart();
        });
    });

    // Generate player name inputs
    function generatePlayerNameInputs() {
        const container = document.getElementById('playerNamesContainer');
        const section = document.getElementById('playerNamesSection');
        
        if (!selectedPlayerCount) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        container.innerHTML = '';
        
        // Keep existing names if resizing
        const existingNames = [...playerNames];
        playerNames = [];

        for (let i = 0; i < selectedPlayerCount; i++) {
            const inputDiv = document.createElement('div');
            inputDiv.className = 'player-name-input';
            
            inputDiv.innerHTML = `
                <label for="player${i}">Jogador ${i + 1}:</label>
                <input 
                    type="text" 
                    id="player${i}" 
                    placeholder="Nome do jogador ${i + 1}"
                    data-index="${i}"
                    value="${existingNames[i] || ''}"
                >
            `;
            
            container.appendChild(inputDiv);
            
            const input = inputDiv.querySelector('input');
            input.addEventListener('input', (e) => {
                playerNames[i] = e.target.value.trim() || `Jogador ${i + 1}`;
            });
            
            // Initialize with default or existing name
            playerNames[i] = existingNames[i] || `Jogador ${i + 1}`;
        }
    }

    // Special character selection
    const characterCheckboxes = document.querySelectorAll('.character-option input[type="checkbox"]');
    characterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                selectedSpecials.add(checkbox.value);
                
                // Show Comandante Falso options
                if (checkbox.value === 'comandantefalso') {
                    document.getElementById('comandanteFalsoOptions').style.display = 'block';
                }
                
                // Show Desertor options
                if (checkbox.value === 'desertor') {
                    document.getElementById('desertorOptions').style.display = 'block';
                }
            } else {
                selectedSpecials.delete(checkbox.value);
                
                // Hide Comandante Falso options
                if (checkbox.value === 'comandantefalso') {
                    document.getElementById('comandanteFalsoOptions').style.display = 'none';
                }
                
                // Hide Desertor options
                if (checkbox.value === 'desertor') {
                    document.getElementById('desertorOptions').style.display = 'none';
                }
            }
            updateGameInfo();
            validateStart();
        });
    });

    // Update game info display
    function updateGameInfo() {
        const gameInfo = document.getElementById('gameInfo');
        
        if (!selectedPlayerCount) {
            gameInfo.innerHTML = '<p>Selecione o número de jogadores para continuar</p>';
            return;
        }

        const spyCount = GameManager.getSpyCount(selectedPlayerCount);
        const resistanceCount = selectedPlayerCount - spyCount;

        let html = `
            <p><strong>Jogadores:</strong> ${selectedPlayerCount}</p>
            <p><strong>Resistência:</strong> ${resistanceCount} | <strong>Espiões:</strong> ${spyCount}</p>
        `;

        if (selectedSpecials.size > 0) {
            let specialCount = selectedSpecials.size;
            // Desertor counts as 2
            if (selectedSpecials.has('desertor')) {
                specialCount += 1;
            }
            html += `<p><strong>Personagens Especiais:</strong> ${specialCount}</p>`;
        }

        gameInfo.innerHTML = html;
    }

    // Validate if game can start
    function validateStart() {
        const btnStart = document.getElementById('btnStart');
        
        if (selectedPlayerCount) {
            btnStart.disabled = false;
        } else {
            btnStart.disabled = true;
        }
    }

    // Save current configuration to history
    function saveToHistory() {
        const options = {
            comandanteFalsoKnows: false,
            desertoresKnowEachOther: false
        };

        if (selectedSpecials.has('comandantefalso')) {
            const selectedOption = document.querySelector('input[name="comandanteFalsoType"]:checked');
            options.comandanteFalsoKnows = selectedOption.value === 'knows';
        }

        if (selectedSpecials.has('desertor')) {
            const selectedOption = document.querySelector('input[name="desertorType"]:checked');
            options.desertoresKnowEachOther = selectedOption.value === 'knowEachOther';
        }

        const history = {
            playerCount: selectedPlayerCount,
            playerNames: [...playerNames],
            selectedSpecials: Array.from(selectedSpecials),
            options: options,
            timestamp: Date.now()
        };

        localStorage.setItem('resistanceHistory', JSON.stringify(history));
    }

    // Load configuration from history
    function loadFromHistory() {
        const saved = localStorage.getItem('resistanceHistory');
        if (!saved) {
            alert('Nenhum histórico encontrado!');
            return;
        }

        const history = JSON.parse(saved);

        // Set player count
        selectedPlayerCount = history.playerCount;
        playerButtons.forEach(btn => {
            btn.classList.remove('selected');
            if (parseInt(btn.dataset.players) === history.playerCount) {
                btn.classList.add('selected');
            }
        });

        // Set player names
        playerNames = [...history.playerNames];
        generatePlayerNameInputs();

        // Set selected specials
        selectedSpecials.clear();
        characterCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        history.selectedSpecials.forEach(special => {
            selectedSpecials.add(special);
            const checkbox = document.getElementById(special);
            if (checkbox) {
                checkbox.checked = true;
                
                // Show options if needed
                if (special === 'comandantefalso') {
                    document.getElementById('comandanteFalsoOptions').style.display = 'block';
                    const option = history.options.comandanteFalsoKnows ? 'knows' : 'doesntKnow';
                    document.querySelector(`input[name="comandanteFalsoType"][value="${option}"]`).checked = true;
                }
                
                if (special === 'desertor') {
                    document.getElementById('desertorOptions').style.display = 'block';
                    const option = history.options.desertoresKnowEachOther ? 'knowEachOther' : 'dontKnow';
                    document.querySelector(`input[name="desertorType"][value="${option}"]`).checked = true;
                }
            }
        });

        updateGameInfo();
        validateStart();

        alert('✅ Configuração carregada com sucesso!');
    }

    // Check if history exists
    function checkHistory() {
        const saved = localStorage.getItem('resistanceHistory');
        const btnLoad = document.getElementById('btnLoadHistory');
        const btnClear = document.getElementById('btnClearHistory');
        const historyInfo = document.getElementById('historyInfo');

        if (saved) {
            const history = JSON.parse(saved);
            const date = new Date(history.timestamp);
            const dateStr = date.toLocaleString('pt-BR');

            btnLoad.disabled = false;
            btnClear.disabled = false;
            historyInfo.style.display = 'block';
            historyInfo.textContent = `Última configuração: ${history.playerCount} jogadores - ${dateStr}`;
        } else {
            btnLoad.disabled = true;
            btnClear.disabled = true;
            historyInfo.style.display = 'none';
        }
    }

    // Clear history
    function clearHistory() {
        if (confirm('Tem certeza que deseja limpar o histórico?')) {
            localStorage.removeItem('resistanceHistory');
            checkHistory();
            alert('🗑️ Histórico limpo com sucesso!');
        }
    }

    // Load History Button
    document.getElementById('btnLoadHistory').addEventListener('click', loadFromHistory);

    // Clear History Button
    document.getElementById('btnClearHistory').addEventListener('click', clearHistory);

    // Start game
    document.getElementById('btnStart').addEventListener('click', () => {
        if (!selectedPlayerCount) {
            alert('Selecione o número de jogadores!');
            return;
        }

        // Save to history before starting
        saveToHistory();

        // Get options
        const options = {
            comandanteFalsoKnows: false,
            desertoresKnowEachOther: false
        };

        if (selectedSpecials.has('comandantefalso')) {
            const selectedOption = document.querySelector('input[name="comandanteFalsoType"]:checked');
            options.comandanteFalsoKnows = selectedOption.value === 'knows';
        }

        if (selectedSpecials.has('desertor')) {
            const selectedOption = document.querySelector('input[name="desertorType"]:checked');
            options.desertoresKnowEachOther = selectedOption.value === 'knowEachOther';
        }

        // Distribute roles
        const roles = GameManager.distributeRoles(
            selectedPlayerCount,
            Array.from(selectedSpecials),
            options,
            playerNames
        );

        // Save game state
        GameManager.saveGame(selectedPlayerCount, roles, playerNames);

        // Navigate to reveal screen
        window.location.href = 'reveal.html';
    });

    // Initialize
    updateGameInfo();
});