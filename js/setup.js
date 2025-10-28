document.addEventListener('DOMContentLoaded', () => {
    let selectedPlayerCount = null;
    const selectedSpecials = new Set();

    // Player count selection
    const playerButtons = document.querySelectorAll('.btn-player');
    playerButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            playerButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedPlayerCount = parseInt(btn.dataset.players);
            updateGameInfo();
            validateStart();
        });
    });

    // Special character selection
    const characterCheckboxes = document.querySelectorAll('.character-option input[type="checkbox"]');
    characterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                selectedSpecials.add(checkbox.value);
            } else {
                selectedSpecials.delete(checkbox.value);
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
            html += `<p><strong>Personagens Especiais:</strong> ${selectedSpecials.size}</p>`;
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

        // Distribute roles
        const roles = GameManager.distributeRoles(
            selectedPlayerCount,
            Array.from(selectedSpecials)
        );

        // Save game state
        GameManager.saveGame(selectedPlayerCount, roles);

        // Navigate to reveal screen
        window.location.href = 'reveal.html';
    });

    // Initialize
    updateGameInfo();
});
