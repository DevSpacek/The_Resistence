// Multiplayer Manager for The Resistance
class MultiplayerManager {
	constructor() {
		this.peer = null;
		this.connections = new Map(); // Map of peerId -> connection
		this.players = new Map(); // Map of peerId -> player info
		this.isHost = false;
		this.hostConnection = null;
		this.roomCode = null;
		this.myPeerId = null;
		this.myPlayerName = null;
		this.gameState = null;
		this.myRole = null;

		// Configuration state (for host)
		this.selectedPlayerCount = null;
		this.selectedSpecials = new Set();
		this.gameOptions = {
			comandanteFalsoKnows: false,
			desertoresKnowEachOther: false,
		};
	}

	// Initialize PeerJS connection
	init(playerName) {
		return new Promise((resolve, reject) => {
			this.myPlayerName = playerName;

			// Create peer with custom configuration for LAN
			this.peer = new Peer({
				config: {
					iceServers: [
						{ urls: "stun:stun.l.google.com:19302" },
						{ urls: "stun:stun1.l.google.com:19302" },
					],
				},
			});

			this.peer.on("open", (id) => {
				console.log("Peer ID:", id);
				this.myPeerId = id;
				resolve(id);
			});

			this.peer.on("error", (error) => {
				console.error("Peer error:", error);
				reject(error);
			});

			// Handle incoming connections (for host)
			this.peer.on("connection", (conn) => {
				this.handleIncomingConnection(conn);
			});
		});
	}

	// Create a room (host)
	createRoom() {
		this.isHost = true;
		this.roomCode = this.generateRoomCode();

		// Add host as first player
		this.players.set(this.myPeerId, {
			peerId: this.myPeerId,
			name: this.myPlayerName,
			isHost: true,
			ready: true,
		});

		console.log("Room created:", this.roomCode);
		return this.roomCode;
	}

	// Join a room (client)
	joinRoom(roomCode) {
		return new Promise((resolve, reject) => {
			this.isHost = false;
			this.roomCode = roomCode;

			// The room code IS the host's peer ID
			const hostPeerId = roomCode;

			console.log("Connecting to host:", hostPeerId);

			// Set timeout for connection attempt
			const connectionTimeout = setTimeout(() => {
				reject(
					new Error(
						"Tempo de conexão esgotado. Verifique se o código está correto e se o host está online."
					)
				);
			}, 15000); // 15 seconds timeout

			const conn = this.peer.connect(hostPeerId, {
				reliable: true,
			});

			conn.on("open", () => {
				console.log("Connected to host");
				clearTimeout(connectionTimeout);
				this.hostConnection = conn;

				// Send join request
				this.sendToHost({
					type: "join",
					playerName: this.myPlayerName,
					peerId: this.myPeerId,
				});

				this.setupConnectionHandlers(conn);
				resolve();
			});

			conn.on("error", (error) => {
				console.error("Connection error:", error);
				clearTimeout(connectionTimeout);
				reject(
					new Error(
						"Erro ao conectar: " +
							(error.message || "Código inválido ou host offline")
					)
				);
			});
		});
	}

	// Handle incoming connection (host only)
	handleIncomingConnection(conn) {
		if (!this.isHost) return;

		console.log("New connection from:", conn.peer);

		conn.on("open", () => {
			this.connections.set(conn.peer, conn);
			this.setupConnectionHandlers(conn);
		});

		conn.on("error", (error) => {
			console.error("Connection error:", error);
			this.connections.delete(conn.peer);
			this.players.delete(conn.peer);
			this.broadcastPlayerList();
		});
	}

	// Setup handlers for a connection
	setupConnectionHandlers(conn) {
		conn.on("data", (data) => {
			this.handleMessage(data, conn);
		});

		conn.on("close", () => {
			console.log("Connection closed:", conn.peer);
			this.connections.delete(conn.peer);
			this.players.delete(conn.peer);

			if (this.isHost) {
				this.broadcastPlayerList();
			}
		});
	}

	// Handle incoming messages
	handleMessage(data, conn) {
		console.log("Received message:", data);

		switch (data.type) {
			case "join":
				if (this.isHost) {
					this.handleJoinRequest(data, conn);
				}
				break;

			case "playerList":
				this.handlePlayerList(data);
				break;

			case "startGame":
				this.handleGameStart(data);
				break;

			case "roleAssignment":
				this.handleRoleAssignment(data);
				break;

			case "gameConfig":
				this.handleGameConfig(data);
				break;

			default:
				console.warn("Unknown message type:", data.type);
		}
	}

	// Handle join request (host only)
	handleJoinRequest(data, conn) {
		const { playerName, peerId } = data;

		// Check if room is full
		if (this.players.size >= 10) {
			this.sendToConnection(conn, {
				type: "error",
				message: "Sala cheia! Máximo de 10 jogadores.",
			});
			conn.close();
			return;
		}

		// Add player
		this.players.set(peerId, {
			peerId: peerId,
			name: playerName,
			isHost: false,
			ready: true,
		});

		console.log("Player joined:", playerName);

		// Send confirmation
		this.sendToConnection(conn, {
			type: "joinSuccess",
			roomCode: this.roomCode,
		});

		// Broadcast updated player list
		this.broadcastPlayerList();
	}

	// Handle player list update
	handlePlayerList(data) {
		this.players.clear();
		data.players.forEach((player) => {
			this.players.set(player.peerId, player);
		});

		// Update UI
		if (window.updateWaitingRoomUI) {
			window.updateWaitingRoomUI();
		}
	}

	// Handle game start
	handleGameStart(data) {
		console.log("Game starting with config:", data.config);
		this.selectedPlayerCount = data.config.playerCount;
		this.selectedSpecials = new Set(data.config.selectedSpecials);
		this.gameOptions = data.config.options;

		// Request role assignment
		if (window.onGameStartReceived) {
			window.onGameStartReceived();
		}
	}

	// Handle role assignment
	handleRoleAssignment(data) {
		this.myRole = data.role;
		console.log("Received role:", this.myRole);

		// Display role to player
		if (window.displayPlayerRole) {
			window.displayPlayerRole(this.myRole);
		}
	}

	// Handle game configuration (for clients to configure before starting)
	handleGameConfig(data) {
		// This could be used to send configuration UI to clients
		// For now, only host configures
	}

	// Broadcast player list to all clients (host only)
	broadcastPlayerList() {
		if (!this.isHost) return;

		const playerList = Array.from(this.players.values());

		this.connections.forEach((conn) => {
			this.sendToConnection(conn, {
				type: "playerList",
				players: playerList,
			});
		});

		// Update host UI
		if (window.updateHostUI) {
			window.updateHostUI();
		}
	}

	// Start the game (host only)
	startGame(config) {
		if (!this.isHost) return;

		console.log("Starting game with config:", config);

		// Create ordered list of players
		const playerList = Array.from(this.players.values());
		const playerNames = playerList.map((p) => p.name);

		// Distribute roles using existing game logic
		const roles = GameManager.distributeRoles(
			playerList.length,
			config.selectedSpecials,
			config.options,
			playerNames
		);

		console.log("Roles distributed:", roles);

		// Send game start signal to all clients
		this.connections.forEach((conn) => {
			this.sendToConnection(conn, {
				type: "startGame",
				config: {
					playerCount: playerList.length,
					selectedSpecials: config.selectedSpecials,
					options: config.options,
				},
			});
		});

		// Send individual roles to each player
		playerList.forEach((player, index) => {
			const role = roles[index];

			if (player.peerId === this.myPeerId) {
				// Host's role
				this.myRole = role;
				if (window.displayPlayerRole) {
					window.displayPlayerRole(role);
				}
			} else {
				// Send to client
				const conn = this.connections.get(player.peerId);
				if (conn) {
					this.sendToConnection(conn, {
						type: "roleAssignment",
						role: role,
					});
				}
			}
		});

		// Save game state
		this.gameState = {
			playerCount: playerList.length,
			roles: roles,
			playerNames: playerNames,
		};
	}

	// Send message to host (client only)
	sendToHost(data) {
		if (this.hostConnection && this.hostConnection.open) {
			this.hostConnection.send(data);
		}
	}

	// Send message to specific connection
	sendToConnection(conn, data) {
		if (conn && conn.open) {
			conn.send(data);
		}
	}

	// Generate room code
	generateRoomCode() {
		// Use the peer ID as room code for direct connection
		return this.myPeerId;
	}

	// Disconnect and cleanup
	disconnect() {
		// Close all connections
		this.connections.forEach((conn) => {
			conn.close();
		});

		// Close host connection if client
		if (this.hostConnection) {
			this.hostConnection.close();
		}

		// Destroy peer
		if (this.peer) {
			this.peer.destroy();
		}

		// Reset state
		this.connections.clear();
		this.players.clear();
		this.isHost = false;
		this.hostConnection = null;
		this.roomCode = null;
		this.myPeerId = null;
		this.gameState = null;
		this.myRole = null;
	}

	// Get player count
	getPlayerCount() {
		return this.players.size;
	}

	// Check if minimum players met
	canStartGame() {
		return this.isHost && this.players.size >= 5 && this.players.size <= 10;
	}
}

// Global instance
const multiplayerManager = new MultiplayerManager();

// UI Management
document.addEventListener("DOMContentLoaded", () => {
	// Screen elements
	const selectionScreen = document.getElementById("selectionScreen");
	const joinScreen = document.getElementById("joinScreen");
	const hostScreen = document.getElementById("hostScreen");
	const waitingRoom = document.getElementById("waitingRoom");
	const roleRevealScreen = document.getElementById("roleRevealScreen");

	// Buttons
	const btnCreateRoom = document.getElementById("btnCreateRoom");
	const btnJoinRoom = document.getElementById("btnJoinRoom");
	const btnConnect = document.getElementById("btnConnect");
	const btnBackFromJoin = document.getElementById("btnBackFromJoin");
	const btnCancelRoom = document.getElementById("btnCancelRoom");
	const btnStartGame = document.getElementById("btnStartGame");
	const btnLeaveRoom = document.getElementById("btnLeaveRoom");
	const btnBackToLobby = document.getElementById("btnBackToLobby");

	// Inputs
	const playerNameInput = document.getElementById("playerName");
	const roomCodeInput = document.getElementById("roomCode");

	// Load saved player name
	const savedName = localStorage.getItem("playerName");
	if (savedName) {
		playerNameInput.value = savedName;
	}

	// Create Room
	btnCreateRoom.addEventListener("click", async () => {
		const playerName = playerNameInput.value.trim();

		if (!playerName) {
			alert("Por favor, digite seu nome!");
			return;
		}

		// Save player name
		localStorage.setItem("playerName", playerName);

		try {
			showLoading("Criando sala...");

			await multiplayerManager.init(playerName);
			const roomCode = multiplayerManager.createRoom();

			hideLoading();

			// Show host screen
			showScreen(hostScreen);
			displayRoomCode(roomCode);
			generateQRCode(roomCode);
			updateHostUI();
		} catch (error) {
			hideLoading();
			alert("Erro ao criar sala: " + error.message);
			console.error(error);
		}
	});

	// Join Room
	btnJoinRoom.addEventListener("click", () => {
		const playerName = playerNameInput.value.trim();

		if (!playerName) {
			alert("Por favor, digite seu nome!");
			return;
		}

		// Save player name
		localStorage.setItem("playerName", playerName);

		showScreen(joinScreen);
	});

	// Connect to Room
	btnConnect.addEventListener("click", async () => {
		const roomCode = roomCodeInput.value.trim().toUpperCase();

		if (!roomCode) {
			alert("Por favor, digite o código da sala!");
			return;
		}

		const playerName = playerNameInput.value.trim();

		try {
			showJoinStatus("Inicializando...", "connecting");

			await multiplayerManager.init(playerName);

			showJoinStatus("Conectando à sala...", "connecting");

			await multiplayerManager.joinRoom(roomCode);

			hideJoinStatus();

			// Show waiting room
			showScreen(waitingRoom);
			document.getElementById("waitingRoomCode").textContent = roomCode;
			updateWaitingRoomUI();
		} catch (error) {
			const errorMsg = error.message || "Erro desconhecido";
			showJoinStatus(errorMsg, "disconnected");
			console.error(error);

			// Add retry button
			const statusDiv = document.getElementById("joinStatus");
			const retryBtn = document.createElement("button");
			retryBtn.textContent = "Tentar Novamente";
			retryBtn.className = "btn-secondary";
			retryBtn.style.marginTop = "10px";
			retryBtn.onclick = () => {
				hideJoinStatus();
				multiplayerManager.disconnect();
			};

			// Check if retry button already exists
			if (!statusDiv.querySelector("button")) {
				statusDiv.appendChild(retryBtn);
			}
		}
	});

	// Back from Join
	btnBackFromJoin.addEventListener("click", () => {
		showScreen(selectionScreen);
		roomCodeInput.value = "";
		hideJoinStatus();
	});

	// Cancel Room (Host)
	btnCancelRoom.addEventListener("click", () => {
		if (confirm("Deseja realmente cancelar a sala?")) {
			multiplayerManager.disconnect();
			showScreen(selectionScreen);
		}
	});

	// Leave Room (Client)
	btnLeaveRoom.addEventListener("click", () => {
		if (confirm("Deseja realmente sair da sala?")) {
			multiplayerManager.disconnect();
			showScreen(selectionScreen);
		}
	});

	// Start Game (Host)
	btnStartGame.addEventListener("click", () => {
		// Get game configuration
		const playerCount = multiplayerManager.getPlayerCount();

		// For now, use default configuration
		// In future, add configuration UI for host
		const config = {
			selectedSpecials: [], // Can be configured
			options: {
				comandanteFalsoKnows: false,
				desertoresKnowEachOther: false,
			},
		};

		// Show configuration modal (to be implemented)
		showGameConfigModal(config);
	});

	// Back to Lobby
	btnBackToLobby.addEventListener("click", () => {
		if (multiplayerManager.isHost) {
			showScreen(hostScreen);
		} else {
			showScreen(waitingRoom);
		}
	});

	// Helper Functions

	function showScreen(screen) {
		[
			selectionScreen,
			joinScreen,
			hostScreen,
			waitingRoom,
			roleRevealScreen,
		].forEach((s) => s.classList.add("hidden"));
		screen.classList.remove("hidden");
	}

	function showLoading(message) {
		// Simple alert for now - can be improved with modal
		console.log("Loading:", message);
	}

	function hideLoading() {
		console.log("Loading complete");
	}

	function showJoinStatus(message, type = "connecting") {
		const statusDiv = document.getElementById("joinStatus");
		statusDiv.classList.remove("hidden", "connecting", "connected", "error");
		statusDiv.classList.add(type);
		statusDiv.innerHTML = `<p>${message}</p>`;
	}

	function hideJoinStatus() {
		const statusDiv = document.getElementById("joinStatus");
		statusDiv.classList.add("hidden");
	}

	function displayRoomCode(code) {
		const displayElement = document.getElementById("displayRoomCode");
		displayElement.textContent = code;

		// Add copy functionality
		const btnCopy = document.getElementById("btnCopyCode");
		const copyFeedback = document.getElementById("copyFeedback");

		if (btnCopy) {
			// Remove existing event listeners to avoid duplicates
			const newBtnCopy = btnCopy.cloneNode(true);
			btnCopy.parentNode.replaceChild(newBtnCopy, btnCopy);

			newBtnCopy.addEventListener("click", async () => {
				try {
					// Try using modern clipboard API
					if (navigator.clipboard && navigator.clipboard.writeText) {
						await navigator.clipboard.writeText(code);
						showCopySuccess(newBtnCopy, copyFeedback);
					} else {
						// Fallback for older browsers
						copyToClipboardFallback(code);
						showCopySuccess(newBtnCopy, copyFeedback);
					}
				} catch (error) {
					console.error("Error copying code:", error);
					// Try fallback method
					try {
						copyToClipboardFallback(code);
						showCopySuccess(newBtnCopy, copyFeedback);
					} catch (fallbackError) {
						console.error("Fallback copy failed:", fallbackError);
						alert("Não foi possível copiar automaticamente. Código: " + code);
					}
				}
			});

			// Also allow clicking the code itself to copy
			displayElement.addEventListener("click", () => {
				newBtnCopy.click();
			});
			displayElement.style.cursor = "pointer";
		}
	}

	// Show copy success feedback
	function showCopySuccess(button, feedback) {
		// Change button appearance
		button.textContent = "✅ Copiado!";
		button.classList.add("copied");

		// Show feedback message
		if (feedback) {
			feedback.classList.add("show");
		}

		// Reset after 3 seconds
		setTimeout(() => {
			button.textContent = "📋 Copiar Código";
			button.classList.remove("copied");
			if (feedback) {
				feedback.classList.remove("show");
			}
		}, 3000);
	}

	// Fallback copy method for older browsers
	function copyToClipboardFallback(text) {
		// Create temporary textarea
		const textarea = document.createElement("textarea");
		textarea.value = text;
		textarea.style.position = "fixed";
		textarea.style.top = "0";
		textarea.style.left = "0";
		textarea.style.opacity = "0";
		document.body.appendChild(textarea);

		// Select and copy
		textarea.focus();
		textarea.select();

		try {
			const successful = document.execCommand("copy");
			if (!successful) {
				throw new Error("Copy command failed");
			}
		} finally {
			document.body.removeChild(textarea);
		}
	}

	function generateQRCode(roomCode) {
		const container = document.getElementById("qrCodeContainer");
		container.innerHTML = ""; // Clear previous QR code

		// Create QR code with room join URL
		const joinURL = `${window.location.origin}${window.location.pathname}?join=${roomCode}`;

		try {
			new QRCode(container, {
				text: joinURL,
				width: 200,
				height: 200,
				colorDark: "#4a90e2",
				colorLight: "#ffffff",
				correctLevel: QRCode.CorrectLevel.H,
			});

			const label = document.createElement("p");
			label.textContent = "Escaneie para entrar rapidamente";
			label.style.marginTop = "10px";
			label.style.fontSize = "0.9rem";
			label.style.color = "#7f8c8d";
			container.appendChild(label);
		} catch (error) {
			console.error("Error generating QR code:", error);
		}
	}

	// Update Host UI
	window.updateHostUI = function () {
		const playerList = document.getElementById("playerList");
		const playerCount = document.getElementById("playerCount");
		const btnStart = document.getElementById("btnStartGame");

		playerList.innerHTML = "";
		playerCount.textContent = multiplayerManager.getPlayerCount();

		// Enable start button if enough players
		btnStart.disabled = !multiplayerManager.canStartGame();

		// Display players
		multiplayerManager.players.forEach((player) => {
			const li = document.createElement("li");
			li.className = "player-item";

			if (player.isHost) {
				li.classList.add("host");
			} else {
				li.classList.add("ready");
			}

			li.innerHTML = `
                <span><strong>${player.name}</strong></span>
                <span class="status-badge ${player.isHost ? "host" : "ready"}">
                    ${player.isHost ? "👑 Host" : "✓ Pronto"}
                </span>
            `;

			playerList.appendChild(li);
		});
	};

	// Update Waiting Room UI
	window.updateWaitingRoomUI = function () {
		const playerList = document.getElementById("waitingPlayerList");
		const playerCount = document.getElementById("waitingPlayerCount");

		playerList.innerHTML = "";
		playerCount.textContent = multiplayerManager.getPlayerCount();

		// Display players
		multiplayerManager.players.forEach((player) => {
			const li = document.createElement("li");
			li.className = "player-item";

			if (player.isHost) {
				li.classList.add("host");
			} else {
				li.classList.add("ready");
			}

			li.innerHTML = `
                <span><strong>${player.name}</strong></span>
                <span class="status-badge ${player.isHost ? "host" : "ready"}">
                    ${player.isHost ? "👑 Host" : "✓ Pronto"}
                </span>
            `;

			playerList.appendChild(li);
		});
	};

	// Handle game start received (client)
	window.onGameStartReceived = function () {
		console.log("Game is starting...");
		// Role will be sent separately
	};

	// Display player role
	window.displayPlayerRole = function (role) {
		const roleCard = document.getElementById("playerRoleCard");

		// Use existing role display logic from reveal.js
		displayRoleCard(roleCard, role);

		// Show role screen
		showScreen(roleRevealScreen);
	};

	// Display role card (similar to reveal.js)
	function displayRoleCard(container, role) {
		container.innerHTML = "";
		container.className = "role-card " + role.faction;

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
			container.style.backgroundImage = `url('${randomImage}')`;
		} else if (role.faction === "spy") {
			const spyImages = [
				"images_back/axis-1-en.jpg",
				"images_back/axis-2-en.jpg",
				"images_back/axis-3-en.jpg",
				"images_back/axis-4.jpg",
			];
			const randomImage =
				spyImages[Math.floor(Math.random() * spyImages.length)];
			container.style.backgroundImage = `url('${randomImage}')`;
		}

		const html = `
            <div class="role-content">
                <div class="role-icon">${role.displayName.split(" ")[0]}</div>
                <h2 class="role-title">${role.displayName}</h2>
                <div class="faction-badge ${role.faction}">
                    ${role.faction === "resistance" ? "Resistência" : "Espião"}
                </div>
                <div class="role-info">
                    <p>${role.description}</p>
                    ${generateRoleSpecificInfo(role)}
                </div>
            </div>
        `;

		container.innerHTML = html;
	}

	// Generate role-specific information
	function generateRoleSpecificInfo(role) {
		let html = "";

		// Add spy list if applicable
		if (role.knowsSpies && !role.isBlind && role.faction === "spy") {
			// Note: In multiplayer, we can't show other players directly
			// This information will need to be handled differently
			html += `
                <div class="info-box">
                    <p><strong>ℹ️ Informação:</strong> Você conhece os outros espiões. Durante a fase de revelação, todos os espiões devem se revelar entre si.</p>
                </div>
            `;
		}

		if (role.isBlind) {
			html += `
                <div class="info-box warning">
                    <p><strong>⚠️ Atenção:</strong> Você NÃO conhece os outros espiões e eles NÃO conhecem você!</p>
                    <p><strong>⚠️ Importante:</strong> O Comandante SABE quem você é!</p>
                </div>
            `;
		}

		if (role.key === "comandante") {
			html += `
                <div class="info-box">
                    <p><strong>🔍 Poder Especial:</strong> Durante a fase de revelação, todos os espiões (exceto Agente Invisível) devem se revelar para você!</p>
                </div>
            `;
		}

		return html;
	}

	// Game Configuration Modal (for host)
	function showGameConfigModal(config) {
		// Create a modal for game configuration
		const modal = document.createElement("div");
		modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
        `;

		const content = document.createElement("div");
		content.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 30px;
            max-width: 500px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
        `;

		content.innerHTML = `
            <h2>Configuração do Jogo</h2>
            <p class="info-text">Selecione os personagens especiais para esta partida:</p>
            
            <div class="characters-grid" style="margin: 20px 0;">
                <label class="character-option resistance">
                    <input type="checkbox" id="modal-comandante" value="comandante">
                    <div class="character-card">
                        <h3>👑 Comandante</h3>
                        <span class="faction">Resistência</span>
                    </div>
                </label>

                <label class="character-option resistance">
                    <input type="checkbox" id="modal-guardacostas" value="guardacostas">
                    <div class="character-card">
                        <h3>🛡️ Guarda-Costas</h3>
                        <span class="faction">Resistência</span>
                    </div>
                </label>

                <label class="character-option spy">
                    <input type="checkbox" id="modal-assassino" value="assassino">
                    <div class="character-card">
                        <h3>🗡️ Assassino</h3>
                        <span class="faction">Espião</span>
                    </div>
                </label>

                <label class="character-option spy">
                    <input type="checkbox" id="modal-espiaocego" value="espiaocego">
                    <div class="character-card">
                        <h3>👁️ Espião Cego</h3>
                        <span class="faction">Espião</span>
                    </div>
                </label>

                <label class="character-option spy">
                    <input type="checkbox" id="modal-agenteinvisivel" value="agenteinvisivel">
                    <div class="character-card">
                        <h3>👻 Agente Invisível</h3>
                        <span class="faction">Espião</span>
                    </div>
                </label>

                <label class="character-option spy">
                    <input type="checkbox" id="modal-comandantefalso" value="comandantefalso">
                    <div class="character-card">
                        <h3>👹 Comandante Falso</h3>
                        <span class="faction">Espião</span>
                    </div>
                </label>
            </div>

            <div class="btn-group" style="margin-top: 30px;">
                <button class="btn-secondary" id="modal-cancel">Cancelar</button>
                <button class="btn-primary" id="modal-start">Iniciar Jogo</button>
            </div>
        `;

		modal.appendChild(content);
		document.body.appendChild(modal);

		// Handle modal actions
		const selectedSpecials = new Set();

		content.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
			checkbox.addEventListener("change", () => {
				if (checkbox.checked) {
					selectedSpecials.add(checkbox.value);
				} else {
					selectedSpecials.delete(checkbox.value);
				}
			});
		});

		document.getElementById("modal-cancel").addEventListener("click", () => {
			document.body.removeChild(modal);
		});

		document.getElementById("modal-start").addEventListener("click", () => {
			config.selectedSpecials = Array.from(selectedSpecials);

			// Start the game
			multiplayerManager.startGame(config);

			// Remove modal
			document.body.removeChild(modal);
		});
	}

	// Check for join code in URL
	const urlParams = new URLSearchParams(window.location.search);
	const joinCode = urlParams.get("join");
	if (joinCode) {
		roomCodeInput.value = joinCode;
		// Auto-switch to join screen
		// User still needs to enter name
	}
});
