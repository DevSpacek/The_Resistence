document.addEventListener("DOMContentLoaded", () => {
	const gameState = GameManager.loadGame();

	if (!gameState) {
		const navLink = document.createElement("a");
		navLink.href = "index.html";
		document.body.appendChild(navLink);
		navLink.click();
		return;
	}

	let currentPlayer = 0;
	const { playerCount, roles, playerNames } = gameState;

	// Ensure boardState exists
	if (!gameState.boardState) {
		const hasDesertor = roles.some((r) => r.isDesertor);
		gameState.boardState = GameManager.createBoardState(
			playerCount,
			hasDesertor,
			playerNames
		);
		GameManager.updateSavedGame(gameState);
	}

	const revealFlowContainer = document.getElementById("revealFlowContainer");
	const boardFlowContainer = document.getElementById("boardFlowContainer");
	const revealSubtitle = document.getElementById("revealSubtitle");

	// Update UI for current player
	function updateUI() {
		const playerName = roles[currentPlayer].playerName;
		document.getElementById("currentPlayerNum").textContent = playerName;
		document.getElementById("playerNumber").textContent = playerName;
	}

	// Show privacy screen
	function showPrivacyScreen() {
		document.getElementById("privacyScreen").classList.remove("hidden");
		document.getElementById("roleScreen").classList.add("hidden");
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	// Show role screen
	function showRoleScreen() {
		document.getElementById("privacyScreen").classList.add("hidden");
		document.getElementById("roleScreen").classList.remove("hidden");

		const role = roles[currentPlayer];
		displayRole(role);
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	// Apply saved theme and re-render when theme changes
	GameManager.applySavedTheme();

	// Display role information
	function displayRole(role) {
		const roleCard = document.getElementById("roleCard");
		const roleTitle = document.getElementById("roleTitle");
		const roleIcon = document.getElementById("roleIcon");
		const factionBadge = document.getElementById("factionBadge");
		const roleInfo = document.getElementById("roleInfo");

		const currentTheme = GameManager.getTheme();
		roleCard.className = "role-card " + role.faction;
		factionBadge.className = "faction-badge " + role.faction;

		// Use theme-specific card artwork
		const bgImage = GameManager.getCardImageForRole(
			role,
			currentPlayer,
			currentTheme
		);
		roleCard.style.backgroundImage = `url('${bgImage}')`;

		roleTitle.textContent =
			currentTheme === "fantasy" && role.fantasyTitle
				? role.fantasyTitle
				: role.displayName;
		roleIcon.textContent = role.displayName.split(" ")[0];
		factionBadge.textContent =
			role.faction === "resistance" ? "Resistência" : "Espião";

		// Build full role intel and tactical tips using shared GameManager generator
		roleInfo.innerHTML = GameManager.buildRoleInfoHTML(
			role,
			roles,
			currentPlayer
		);

		const btnNext = document.getElementById("btnNext");
		if (currentPlayer === playerCount - 1) {
			btnNext.textContent = "🎯 Ir para o Tabuleiro de Missões →";
		} else {
			btnNext.textContent = "🔒 Ocultar e Passar ao Próximo Agente →";
		}
	}

	// Transition to Tactical Board after all players have viewed their cards
	let activeBoardController = null;
	function launchMissionBoard() {
		revealFlowContainer.classList.add("hidden");
		boardFlowContainer.classList.remove("hidden");
		revealSubtitle.textContent = "Tabuleiro de Operações & Votação";

		const mount = document.getElementById("tacticalBoardMount");
		activeBoardController = new BoardUIController({
			container: mount,
			boardState: gameState.boardState,
			roles: roles,
			mode: "single",
			onStateChange: (updatedBoardState) => {
				gameState.boardState = updatedBoardState;
				GameManager.updateSavedGame(gameState);
				renderRecheckPlayers();
			},
		});
		activeBoardController.render();
		renderRecheckPlayers();
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	window.addEventListener("resistanceThemeChanged", () => {
		if (activeBoardController) {
			activeBoardController.render();
		} else if (!document.getElementById("roleScreen").classList.contains("hidden")) {
			displayRole(roles[currentPlayer]);
		}
	});

	// Render secret re-check buttons for each player (useful especially if Desertor swaps loyalty)
	function renderRecheckPlayers() {
		const grid = document.getElementById("recheckPlayersGrid");
		if (!grid) return;
		grid.innerHTML = "";

		roles.forEach((role, idx) => {
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = "btn-recheck-player";
			btn.innerHTML = `<span>🔒 ${role.playerName}</span>`;
			btn.addEventListener("click", () => {
				openRecheckModal(role, idx);
			});
			grid.appendChild(btn);
		});
	}

	function openRecheckModal(role, idx) {
		const modal = document.getElementById("recheckModal");
		const nameEl = document.getElementById("recheckModalPlayerName");
		const mount = document.getElementById("recheckModalRoleMount");

		const currentTheme = GameManager.getTheme();
		nameEl.textContent = `Consulta Secreta: ${role.playerName}`;
		const bgImage = GameManager.getCardImageForRole(role, idx, currentTheme);
		const titleText =
			currentTheme === "fantasy" && role.fantasyTitle
				? role.fantasyTitle
				: role.displayName;

		// Step 1: Privacy confirmation inside modal (no native confirm() block)
		mount.innerHTML = `
			<div class="privacy-content" style="margin-top: 12px; padding: 24px 16px;">
				<div class="classified-stamp">CONFIDENCIAL</div>
				<p class="info-text">Confirme que você é <strong>${role.playerName}</strong> e que ninguém mais está olhando para a tela.</p>
				<button type="button" class="btn-primary" id="btnConfirmRecheckReveal">
					👁️ Revelar Minha Carta Atual
				</button>
			</div>
		`;

		modal.classList.remove("hidden");

		document
			.getElementById("btnConfirmRecheckReveal")
			.addEventListener("click", () => {
				mount.innerHTML = `
					<div class="role-card ${role.faction}" style="background-image: url('${bgImage}'); min-height: 420px; margin-top: 12px;">
						<div class="role-header">
							<h2 class="role-title">${titleText}</h2>
							<div class="faction-badge ${role.faction}">
								${role.faction === "resistance" ? "Resistência" : "Espião"}
							</div>
						</div>
						<div class="role-info">
							${GameManager.buildRoleInfoHTML(role, roles, idx)}
						</div>
					</div>
				`;
			});
	}

	const btnCloseModal = document.getElementById("btnCloseRecheckModal");
	if (btnCloseModal) {
		btnCloseModal.addEventListener("click", () => {
			document.getElementById("recheckModal").classList.add("hidden");
		});
	}

	// Reveal button
	document.getElementById("btnReveal").addEventListener("click", () => {
		showRoleScreen();
	});

	// Next button
	document.getElementById("btnNext").addEventListener("click", () => {
		currentPlayer++;

		if (currentPlayer >= playerCount) {
			launchMissionBoard();
		} else {
			updateUI();
			showPrivacyScreen();
		}
	});

	// Initialize
	updateUI();
	showPrivacyScreen();
});
