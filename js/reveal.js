document.addEventListener("DOMContentLoaded", () => {
	const gameState = GameManager.loadGame();

	if (!gameState) {
		alert("Nenhum jogo encontrado! Redirecionando para configuração...");
		window.location.href = "index.html";
		return;
	}

	let currentPlayer = 0;
	const { playerCount, roles, playerNames } = gameState;

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
	}

	// Show role screen
	function showRoleScreen() {
		document.getElementById("privacyScreen").classList.add("hidden");
		document.getElementById("roleScreen").classList.remove("hidden");

		const role = roles[currentPlayer];
		displayRole(role);
	}

	// Display role information
	function displayRole(role) {
		const roleCard = document.getElementById("roleCard");
		const roleTitle = document.getElementById("roleTitle");
		const roleIcon = document.getElementById("roleIcon");
		const factionBadge = document.getElementById("factionBadge");
		const roleInfo = document.getElementById("roleInfo");

		// Set faction styling
		roleCard.className = "role-card " + role.faction;
		factionBadge.className = "faction-badge " + role.faction;

		// Set background image based on faction
		if (role.faction === "resistance") {
			const resistanceImages = [
				"images_back/ally-1-en.jpg",
				"images_back/ally-2-en.jpg",
				"images_back/ally-3-en.jpg",
				"images_back/ally-4-en.jpg",
				"images_back/ally-5.jpg",
				"images_back/ally-6-en.jpg",
			];
			const randomImage =
				resistanceImages[Math.floor(Math.random() * resistanceImages.length)];
			roleCard.style.backgroundImage = `url('${randomImage}')`;
		} else if (role.faction === "spy") {
			const spyImages = [
				"images_back/axis-1-en.jpg",
				"images_back/axis-2-en.jpg",
				"images_back/axis-3-en.jpg",
				"images_back/axis-4.jpg",
			];
			const randomImage =
				spyImages[Math.floor(Math.random() * spyImages.length)];
			roleCard.style.backgroundImage = `url('${randomImage}')`;
		}

		// Set basic info
		roleTitle.textContent = role.displayName;
		roleIcon.textContent = role.displayName.split(" ")[0]; // Get emoji
		factionBadge.textContent =
			role.faction === "resistance" ? "Resistência" : "Espião";

		// Build role information
		let infoHTML = `<p>${role.description}</p>`;

		// COMANDANTE - REGRA OFICIAL: Vê TODOS os espiões (incluindo Espião Cego), EXCETO Agente Invisível
		if (role.key === "comandante") {
			const allSpies = GameManager.getAllSpiesForCommander(roles);

			if (allSpies.length > 0) {
				infoHTML += `
                    <div class="spy-list">
                        <h3>🔍 Espiões Identificados:</h3>
                        <ul>
                            ${allSpies
															.map(
																(spy) =>
																	`<li><strong>${spy.playerName}</strong>${
																		spy.isBlind ? " (Espião Cego)" : ""
																	}</li>`
															)
															.join("")}
                        </ul>
                    </div>
                `;
			}
		}

		// GUARDA-COSTAS - Vê o(s) Comandante(s)
		if (role.key === "guardacostas") {
			const commanders = GameManager.getCommanderInfo(roles);

			if (commanders.length > 0) {
				infoHTML += `
                    <div class="spy-list">
                        <h3>👑 Comandante(s) Identificado(s):</h3>
                        <ul>
                            ${commanders
															.map(
																(cmd) =>
																	`<li><strong>${cmd.playerName}</strong></li>`
															)
															.join("")}
                        </ul>
                `;

				if (commanders.length > 1) {
					infoHTML += `<p class="warning">⚠️ Atenção: Há ${commanders.length} comandantes! Um deles é o Comandante Falso, mas você não sabe qual é o verdadeiro.</p>`;
				}

				infoHTML += `</div>`;
			}
		}

		// ESPIÕES REGULARES (não cegos) - Veem outros espiões (exceto Espião Cego)
		if (role.knowsSpies && !role.isBlind && role.faction === "spy") {
			const spies = GameManager.getSpyInfo(roles, currentPlayer);
			const otherSpies = spies.filter((s) => s.index !== currentPlayer);

			if (otherSpies.length > 0) {
				infoHTML += `
                    <div class="spy-list">
                        <h3>🔍 Outros Espiões:</h3>
                        <ul>
                            ${otherSpies
															.map((spy) => {
																let note = "";
																return `<li><strong>${spy.playerName}</strong>${note}</li>`;
															})
															.join("")}
                        </ul>
                `;

				// Se há Espião Cego, avisar que ele não está na lista
				const blindSpyExists = roles.some(
					(r) => r.isBlind && r.faction === "spy"
				);
				if (blindSpyExists) {
					infoHTML += `<p class="warning">⚠️ Há um Espião Cego que não aparece nesta lista e não conhece vocês.</p>`;
				}

				infoHTML += `</div>`;
			}
		}

		// ESPIÃO CEGO - REGRA OFICIAL
		if (role.isBlind) {
			infoHTML += `
                <div class="info-box warning">
                    <p><strong>⚠️ Atenção:</strong> Você NÃO conhece os outros espiões e eles NÃO conhecem você!</p>
                    <p><strong>⚠️ Importante:</strong> O Comandante SABE quem você é!</p>
                </div>
            `;
		}

		// AGENTE INVISÍVEL
		if (role.key === "agenteinvisivel") {
			infoHTML += `
                <div class="info-box">
                    <p><strong>👻 Invisibilidade:</strong> O Comandante NÃO consegue ver você!</p>
                </div>
            `;
		}

		// COMANDANTE FALSO
		if (role.isFalseCommander && !role.knowsSpies) {
			infoHTML += `
                <div class="info-box warning">
                    <p><strong>⚠️ Poder Especial:</strong> Você se revela ao Guarda-Costas como se fosse o Comandante!</p>
                    <p>Você NÃO conhece os outros espiões (regra oficial).</p>
                </div>
            `;
		} else if (role.isFalseCommander && role.knowsSpies) {
			infoHTML += `
                <div class="info-box warning">
                    <p><strong>⚠️ Poder Especial:</strong> Você se revela ao Guarda-Costas como se fosse o Comandante!</p>
                    <p>Você conhece os outros espiões (variante).</p>
                </div>
            `;
		}

		// ASSASSINO
		if (role.key === "assassino") {
			infoHTML += `
                <div class="info-box">
                    <h3>🎯 Missão Especial:</h3>
                    <p>Se a Resistência vencer 3 missões, você terá UMA CHANCE de identificar e eliminar o Comandante. Se acertar, os espiões vencem!</p>
                </div>
            `;
		}

		// DESERTOR
		if (role.isDesertor) {
			infoHTML += `
                <div class="info-box">
                    <h3>🔄 Troca de Lealdade:</h3>
                    <p>A partir da 3ª rodada, vire uma carta do Baralho de Troca de Lealdade no início de cada turno.</p>
                    <p>Se a carta "Troca de Lealdade" for virada, você e o outro Desertor trocam de lado secretamente!</p>
                </div>
            `;

			// // Se Espião Desertor
			// if (role.faction === "spy" && role.thumbsUp) {
			// 	infoHTML += `
			//         <div class="info-box warning">
			//             <p><strong>👍 Revelação:</strong> Durante a fase de revelação, ESTENDA SEU POLEGAR ao invés de abrir os olhos!</p>
			//         </div>
			//     `;
			// }

			// Se desertores se conhecem
			if (role.knowsOtherDesertor && role.otherDesertorIndex !== undefined) {
				const otherDesertor = roles[role.otherDesertorIndex];
				infoHTML += `
                    <div class="spy-list">
                        <h3>🔄 Outro Desertor:</h3>
                        <ul>
                            <li><strong>${otherDesertor.playerName}</strong> (${
					otherDesertor.faction === "spy" ? "Espião" : "Resistência"
				})</li>
                        </ul>
                    </div>
                `;
			}
		}

		roleInfo.innerHTML = infoHTML;

		// Update next button
		const btnNext = document.getElementById("btnNext");
		if (currentPlayer === playerCount - 1) {
			btnNext.textContent = "Finalizar e Voltar";
		} else {
			btnNext.textContent = "Próximo Jogador";
		}
	}

	// Reveal button
	document.getElementById("btnReveal").addEventListener("click", () => {
		showRoleScreen();
	});

	// Next button
	document.getElementById("btnNext").addEventListener("click", () => {
		currentPlayer++;

		if (currentPlayer >= playerCount) {
			// Game finished, return to setup
			GameManager.clearGame();
			window.location.href = "index.html";
		} else {
			// Show next player
			updateUI();
			showPrivacyScreen();
		}
	});

	// Initialize
	updateUI();
	showPrivacyScreen();
});
