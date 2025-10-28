document.addEventListener('DOMContentLoaded', () => {
    let selectedPlayerCount = null;
    const selectedSpecials = new Set();
    let playerNames = [];

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
                >
            `;
            
            container.appendChild(inputDiv);
            
            const input = inputDiv.querySelector('input');
            input.addEventListener('input', (e) => {
                playerNames[i] = e.target.value.trim() || `Jogador ${i + 1}`;
            });
            
            // Initialize with default name
            playerNames[i] = `Jogador ${i + 1}`;
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
            } else {
                selectedSpecials.delete(checkbox.value);
                
                // Hide Comandante Falso options
                if (checkbox.value === 'comandantefalso') {
                    document.getElementById('comandanteFalsoOptions').style.display = 'none';
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

    // Start game
    document.getElementById('btnStart').addEventListener('click', () => {
        if (!selectedPlayerCount) {
            alert('Selecione o número de jogadores!');
            return;
        }

        // Get Comandante Falso preference
        let comandanteFalsoKnows = true;
        if (selectedSpecials.has('comandantefalso')) {
            const selectedOption = document.querySelector('input[name="comandanteFalsoType"]:checked');
            comandanteFalsoKnows = selectedOption.value === 'knows';
        }

        // Distribute roles
        const roles = GameManager.distributeRoles(
            selectedPlayerCount,
            Array.from(selectedSpecials),
            comandanteFalsoKnows,
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