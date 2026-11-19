// Multiplayer Manager & Real-Time Tactical Board / Voting Sync for The Resistance
class MultiplayerManager {
	constructor() {
		this.peer = null;
		this.connections = new Map(); // peerId -> DataConnection
		this.players = new Map(); // peerId -> { peerId, name, isHost, ready }
		this.isHost = false;
		this.hostConnection = null;
		this.roomCode = null;
		this.myPeerId = null;
		this.myPlayerName = null;
		this.gameState = null;
		this.myRole = null;

		// Live Multiplayer Board & Voting State
		this.boardState = null;
		this.mpVoteSession = null;
		// mpVoteSession schema:
		// {
		//   type: 'team_approval' | 'mission_execution' | 'loyalty_alert',
		//   status: 'voting' | 'completed',
		//   teamPeerIds: [],
		//   teamNames: [],
		//   votesByPeer: {}, // peerId -> boolean | 'success' | 'fail'
		//   resultSummary: null
		// }
	}

	init(playerName) {
		return new Promise((resolve, reject) => {
			this.myPlayerName = playerName;

			if (this.peer && !this.peer.destroyed) {
				this.peer.destroy();
			}

			// Generate a clean, short 6-character alphanumeric room ID so mobile inputs never overflow!
			const shortId =
				"tr-" +
				Array.from({ length: 6 }, () =>
					"abcdefghjkmnpqrstuvwxyz23456789".charAt(
						Math.floor(Math.random() * 31)
					)
				).join("");

			this.peer = new Peer(shortId, {
				config: {
					iceServers: [
						{ urls: "stun:stun.l.google.com:19302" },
						{ urls: "stun:stun1.l.google.com:19302" },
						{ urls: "stun:stun2.l.google.com:19302" },
						{ urls: "stun:stun3.l.google.com:19302" },
					],
					iceTransportPolicy: "all",
				},
				debug: 1,
			});

			this.peer.on("open", (id) => {
				this.myPeerId = id;
				resolve(id);
			});

			this.peer.on("error", (error) => {
				console.error("PeerJS Error:", error);
				let errorMessage = "Erro ao inicializar conexão.";
				if (error.type === "unavailable-id") {
					errorMessage = "Código temporariamente em uso. Tente novamente.";
				} else if (error.type === "peer-unavailable") {
					errorMessage =
						"Sala não encontrada. Verifique se o código está correto e o Host está online.";
				} else if (error.type === "network") {
					errorMessage = "Erro de rede. Verifique sua conexão com a internet.";
				}
				reject(new Error(errorMessage));
			});

			this.peer.on("connection", (conn) => {
				this.handleIncomingConnection(conn);
			});
		});
	}

	createRoom() {
		this.isHost = true;
		this.roomCode = this.myPeerId;

		this.players.set(this.myPeerId, {
			peerId: this.myPeerId,
			name: this.myPlayerName,
			isHost: true,
			ready: true,
		});

		return this.roomCode;
	}

	joinRoom(rawCode) {
		return new Promise((resolve, reject) => {
			this.isHost = false;
			let normalized = rawCode.trim().toLowerCase();
			// Support typing with or without "tr-" prefix if 6 chars
			if (
				normalized.length === 6 &&
				!normalized.startsWith("tr-") &&
				!normalized.includes("-")
			) {
				normalized = "tr-" + normalized;
			}
			this.roomCode = normalized;

			const connectionTimeout = setTimeout(() => {
				reject(
					new Error(
						"Tempo esgotado (15s). Verifique o código e se o Host está com a sala aberta."
					)
				);
			}, 15000);

			try {
				const conn = this.peer.connect(this.roomCode, {
					reliable: true,
					serialization: "json",
				});

				conn.on("open", () => {
					clearTimeout(connectionTimeout);
					this.hostConnection = conn;

					this.sendToHost({
						type: "join",
						playerName: this.myPlayerName,
						peerId: this.myPeerId,
					});

					this.setupConnectionHandlers(conn);
					resolve();
				});

				conn.on("error", (error) => {
					clearTimeout(connectionTimeout);
					reject(
						new Error(
							"Erro ao conectar: " +
								(error.message || "Sala não encontrada")
						)
					);
				});
			} catch (error) {
				clearTimeout(connectionTimeout);
				reject(error);
			}
		});
	}

	handleIncomingConnection(conn) {
		if (!this.isHost) return;

		conn.on("open", () => {
			this.connections.set(conn.peer, conn);
			this.setupConnectionHandlers(conn);
		});

		conn.on("error", () => {
			this.connections.delete(conn.peer);
			this.players.delete(conn.peer);
			this.broadcastPlayerList();
		});
	}

	setupConnectionHandlers(conn) {
		conn.on("data", (data) => {
			this.handleMessage(data, conn);
		});

		conn.on("close", () => {
			this.connections.delete(conn.peer);
			this.players.delete(conn.peer);
			if (this.isHost) {
				this.broadcastPlayerList();
			}
		});
	}

	handleMessage(data, conn) {
		switch (data.type) {
			case "join":
				if (this.isHost) this.handleJoinRequest(data, conn);
				break;

			case "playerList":
				this.handlePlayerList(data);
				break;

			case "roleAssignment":
				this.handleRoleAssignment(data);
				break;

			case "boardSync":
				this.handleBoardSync(data);
				break;

			case "clientCastVote":
				if (this.isHost) this.handleClientVote(data, conn.peer);
				break;

			default:
				break;
		}
	}

	handleJoinRequest(data, conn) {
		const { playerName, peerId } = data;

		if (this.players.size >= 10) {
			this.sendToConnection(conn, {
				type: "error",
				message: "Sala cheia! Máximo de 10 jogadores.",
			});
			conn.close();
			return;
		}

		this.players.set(peerId, {
			peerId: peerId,
			name: playerName,
			isHost: false,
			ready: true,
		});

		this.sendToConnection(conn, {
			type: "joinSuccess",
			roomCode: this.roomCode,
		});

		this.broadcastPlayerList();

		// If game already running, re-sync board state
		if (this.boardState) {
			this.sendToConnection(conn, {
				type: "boardSync",
				boardState: this.boardState,
				mpVoteSession: this.mpVoteSession,
			});
		}
	}

	handlePlayerList(data) {
		this.players.clear();
		data.players.forEach((p) => {
			this.players.set(p.peerId, p);
		});
		if (window.updateWaitingRoomUI) {
			window.updateWaitingRoomUI();
		}
	}

	handleRoleAssignment(data) {
		this.myRole = data.role;
		this.boardState = data.boardState;
		this.mpVoteSession = data.mpVoteSession || null;

		if (window.displayPlayerRole) {
			window.displayPlayerRole(this.myRole, data.isLoyaltySwapAlert);
		}
		if (window.updateMultiplayerBoardUI) {
			window.updateMultiplayerBoardUI();
		}
	}

	handleBoardSync(data) {
		this.boardState = data.boardState;
		this.mpVoteSession = data.mpVoteSession || null;
		if (window.updateMultiplayerBoardUI) {
			window.updateMultiplayerBoardUI(data.switchedToBoardTab);
		}
	}

	broadcastPlayerList() {
		if (!this.isHost) return;
		const playerList = Array.from(this.players.values());

		this.connections.forEach((conn) => {
			this.sendToConnection(conn, {
				type: "playerList",
				players: playerList,
			});
		});

		if (window.updateHostUI) {
			window.updateHostUI();
		}
	}

	broadcastBoardSync(switchedToBoardTab = false) {
		if (!this.isHost) return;
		const payload = {
			type: "boardSync",
			boardState: this.boardState,
			mpVoteSession: this.getPublicVoteSession(),
			switchedToBoardTab: switchedToBoardTab,
		};

		this.connections.forEach((conn) => {
			this.sendToConnection(conn, payload);
		});

		if (window.updateMultiplayerBoardUI) {
			window.updateMultiplayerBoardUI(switchedToBoardTab);
		}
	}

	// Sanitize vote session before broadcasting so secret mission votes remain 100% anonymous
	getPublicVoteSession() {
		if (!this.mpVoteSession) return null;
		const s = this.mpVoteSession;
		const votedPeerIds = Object.keys(s.votesByPeer || {});

		return {
			type: s.type,
			status: s.status,
			round: s.round,
			teamPeerIds: s.teamPeerIds || [],
			teamNames: s.teamNames || [],
			votedPeerIds: votedPeerIds,
			totalExpected: s.totalExpected || 0,
			resultSummary: s.status === "completed" ? s.resultSummary : null,
			loyaltyCard: s.loyaltyCard || null,
		};
	}

	// Start game: distribute roles, enrich EVERY role with its complete allies & character tips, and initialize board
	startGame(config) {
		if (!this.isHost) return;

		const playerList = Array.from(this.players.values());
		const playerNames = playerList.map((p) => p.name);

		const rawRoles = GameManager.distributeRoles(
			playerList.length,
			config.selectedSpecials,
			config.options,
			playerNames
		);

		const hasInvisible = rawRoles.some((r) => r.key === "agenteinvisivel");

		// Enrich every role with its specific intel (knownSpies, commanders, otherDesertor, etc.)
		const enrichedRoles = rawRoles.map((role, idx) => {
			const enriched = GameManager.enrichRoleWithIntel(role, rawRoles, idx);
			enriched.peerId = playerList[idx].peerId;
			enriched.hasInvisibleWarning = hasInvisible;
			return enriched;
		});

		const hasDesertor =
			config.selectedSpecials.includes("desertor") ||
			enrichedRoles.some((r) => r.isDesertor);

		this.boardState = GameManager.createBoardState(
			playerList.length,
			hasDesertor,
			playerNames
		);
		this.boardState.playerPeers = playerList.map((p) => ({
			peerId: p.peerId,
			name: p.name,
		}));

		this.mpVoteSession = null;

		this.gameState = {
			playerCount: playerList.length,
			roles: enrichedRoles,
			playerNames: playerNames,
			config: config,
		};

		// Send enriched role & boardState to each player
		playerList.forEach((player, index) => {
			const role = enrichedRoles[index];
			if (player.peerId === this.myPeerId) {
				this.myRole = role;
				if (window.displayPlayerRole) {
					window.displayPlayerRole(role, false);
				}
			} else {
				const conn = this.connections.get(player.peerId);
				if (conn) {
					this.sendToConnection(conn, {
						type: "roleAssignment",
						role: role,
						boardState: this.boardState,
						mpVoteSession: null,
						isLoyaltySwapAlert: false,
					});
				}
			}
		});

		if (window.updateMultiplayerBoardUI) {
			window.updateMultiplayerBoardUI(false);
		}
	}

	// Host launches a Team Approval Vote across all connected devices
	startMultiplayerTeamApproval(selectedTeamPeerIds) {
		if (!this.isHost || !this.boardState) return;
		const playerList = Array.from(this.players.values());
		const teamNames = playerList
			.filter((p) => selectedTeamPeerIds.includes(p.peerId))
			.map((p) => p.name);

		this.mpVoteSession = {
			type: "team_approval",
			status: "voting",
			round: this.boardState.currentRound,
			teamPeerIds: selectedTeamPeerIds,
			teamNames: teamNames,
			votesByPeer: {},
			totalExpected: playerList.length,
			resultSummary: null,
		};

		this.broadcastBoardSync(true);
	}

	// Host launches an Anonymous Mission Vote exclusively for the selected team devices
	startMultiplayerMissionVote(selectedTeamPeerIds) {
		if (!this.isHost || !this.boardState) return;
		const playerList = Array.from(this.players.values());
		const teamNames = playerList
			.filter((p) => selectedTeamPeerIds.includes(p.peerId))
			.map((p) => p.name);

		this.mpVoteSession = {
			type: "mission_execution",
			status: "voting",
			round: this.boardState.currentRound,
			teamPeerIds: selectedTeamPeerIds,
			teamNames: teamNames,
			votesByPeer: {},
			totalExpected: selectedTeamPeerIds.length,
			resultSummary: null,
		};

		this.broadcastBoardSync(true);
	}

	// Host draws a Desertor Loyalty Card and automatically swaps the 2 Desertors' roles if 'swap' is drawn
	triggerMultiplayerDesertorDraw() {
		if (!this.isHost || !this.boardState) return;
		const card = GameManager.drawDesertorCard(this.boardState);

		if (card.type === "swap" && this.gameState && this.gameState.roles) {
			const roles = this.gameState.roles;
			const desertores = roles.filter((r) => r.isDesertor);
			if (desertores.length === 2) {
				desertores.forEach((d) => {
					if (d.faction === "resistance") {
						d.faction = "spy";
						d.key = "desertorEspiao";
						d.description =
							"🔄 TROCA DE LEALDADE ATIVADA! Você agora pertence aos ESPIÕES!";
						d.bgImage = "images_back/axis-2-en.jpg";
					} else {
						d.faction = "resistance";
						d.key = "desertorResistencia";
						d.description =
							"🔄 TROCA DE LEALDADE ATIVADA! Você agora pertence à RESISTÊNCIA!";
						d.bgImage = "images_back/ally-2-en.jpg";
					}
				});

				// Re-send updated roles to the two Desertor players so their cards update live!
				roles.forEach((r) => {
					if (r.isDesertor) {
						if (r.peerId === this.myPeerId) {
							this.myRole = r;
							if (window.displayPlayerRole) {
								window.displayPlayerRole(r, true);
							}
						} else {
							const conn = this.connections.get(r.peerId);
							if (conn) {
								this.sendToConnection(conn, {
									type: "roleAssignment",
									role: r,
									boardState: this.boardState,
									mpVoteSession: this.getPublicVoteSession(),
									isLoyaltySwapAlert: true,
								});
							}
						}
					}
				});
			}
		}

		this.mpVoteSession = {
			type: "loyalty_alert",
			status: "completed",
			round: this.boardState.currentRound,
			loyaltyCard: card,
		};

		this.broadcastBoardSync(true);
	}

	// Client or Host submits a vote
	submitVote(voteValue) {
		if (this.isHost) {
			this.handleClientVote({ vote: voteValue }, this.myPeerId);
		} else {
			this.sendToHost({
				type: "clientCastVote",
				vote: voteValue,
			});
		}
	}

	handleClientVote(data, peerId) {
		if (!this.isHost || !this.mpVoteSession || this.mpVoteSession.status !== "voting") {
			return;
		}

		const s = this.mpVoteSession;

		if (s.type === "team_approval") {
			if (!this.players.has(peerId)) return;
			s.votesByPeer[peerId] = data.vote === "approve" || data.vote === true;

			if (Object.keys(s.votesByPeer).length >= s.totalExpected) {
				// Tally team approval votes
				const breakdown = [];
				let approvals = 0;
				let rejections = 0;

				this.players.forEach((p) => {
					const v = !!s.votesByPeer[p.peerId];
					if (v) approvals++;
					else rejections++;
					breakdown.push({ playerName: p.name, approved: v });
				});

				const isApproved = approvals > rejections;
				const outcome = GameManager.registerTeamVoteResult(
					this.boardState,
					isApproved
				);

				s.status = "completed";
				s.resultSummary = {
					approved: isApproved,
					approvals,
					rejections,
					breakdown,
					message: outcome.message,
					fiveRejectionsTriggered: outcome.action === "five_rejections_point",
				};
			}

			this.broadcastBoardSync(false);
		} else if (s.type === "mission_execution") {
			if (!s.teamPeerIds.includes(peerId)) return;
			s.votesByPeer[peerId] = data.vote === "fail" ? "fail" : "success";

			if (Object.keys(s.votesByPeer).length >= s.totalExpected) {
				// Shuffle anonymous mission cards
				const rawVotes = Object.values(s.votesByPeer);
				const shuffledCards = GameManager.shuffleArray(rawVotes);
				const failsCount = shuffledCards.filter((v) => v === "fail").length;
				const successCount = shuffledCards.filter((v) => v === "success").length;
				const currentRoundObj =
					this.boardState.rounds[this.boardState.currentRound - 1];
				const requiredFails =
					currentRoundObj && currentRoundObj.requiresTwoFails ? 2 : 1;
				const missionSucceeded = failsCount < requiredFails;
				const winningFaction = missionSucceeded ? "resistance" : "spy";

				GameManager.recordRoundOutcome(
					this.boardState,
					winningFaction,
					failsCount
				);

				s.status = "completed";
				s.resultSummary = {
					missionSucceeded,
					winningFaction,
					shuffledCards,
					failsCount,
					successCount,
				};
			}

			this.broadcastBoardSync(false);
		}
	}

	sendToHost(data) {
		if (this.hostConnection && this.hostConnection.open) {
			this.hostConnection.send(data);
		}
	}

	sendToConnection(conn, data) {
		if (conn && conn.open) {
			conn.send(data);
		}
	}

	disconnect() {
		this.connections.forEach((conn) => conn.close());
		if (this.hostConnection) this.hostConnection.close();
		if (this.peer) this.peer.destroy();

		this.connections.clear();
		this.players.clear();
		this.isHost = false;
		this.hostConnection = null;
		this.roomCode = null;
		this.myPeerId = null;
		this.gameState = null;
		this.myRole = null;
		this.boardState = null;
		this.mpVoteSession = null;
	}

	getPlayerCount() {
		return this.players.size;
	}

	canStartGame() {
		return this.isHost && this.players.size >= 5 && this.players.size <= 10;
	}
}

const multiplayerManager = new MultiplayerManager();

// UI Logic
document.addEventListener("DOMContentLoaded", () => {
	const selectionScreen = document.getElementById("selectionScreen");
	const joinScreen = document.getElementById("joinScreen");
	const hostScreen = document.getElementById("hostScreen");
	const waitingRoom = document.getElementById("waitingRoom");
	const roleRevealScreen = document.getElementById("roleRevealScreen");

	const btnCreateRoom = document.getElementById("btnCreateRoom");
	const btnJoinRoom = document.getElementById("btnJoinRoom");
	const btnConnect = document.getElementById("btnConnect");
	const btnBackFromJoin = document.getElementById("btnBackFromJoin");
	const btnCancelRoom = document.getElementById("btnCancelRoom");
	const btnStartGame = document.getElementById("btnStartGame");
	const btnLeaveRoom = document.getElementById("btnLeaveRoom");
	const btnBackToLobby = document.getElementById("btnBackToLobby");

	const playerNameInput = document.getElementById("playerName");
	const roomCodeInput = document.getElementById("roomCode");

	// Selected team members on Host Panel
	let hostSelectedTeamPeers = new Set();

	// Load saved player name
	const savedName = localStorage.getItem("playerName");
	if (savedName) {
		playerNameInput.value = savedName;
	}

	// Tabs inside active multiplayer game
	const tabBtnRole = document.getElementById("tabBtnRole");
	const tabBtnBoard = document.getElementById("tabBtnBoard");
	const mpTabRoleContent = document.getElementById("mpTabRoleContent");
	const mpTabBoardContent = document.getElementById("mpTabBoardContent");
	const boardActionBadge = document.getElementById("boardActionBadge");

	function switchMpTab(tabName) {
		if (tabName === "board") {
			tabBtnBoard.classList.add("active");
			tabBtnRole.classList.remove("active");
			mpTabBoardContent.classList.remove("hidden");
			mpTabRoleContent.classList.add("hidden");
			boardActionBadge.classList.add("hidden");
		} else {
			tabBtnRole.classList.add("active");
			tabBtnBoard.classList.remove("active");
			mpTabRoleContent.classList.remove("hidden");
			mpTabBoardContent.classList.add("hidden");
		}
	}

	tabBtnRole.addEventListener("click", () => switchMpTab("role"));
	tabBtnBoard.addEventListener("click", () => switchMpTab("board"));

	// Card Privacy Toggle
	const btnToggleCardPrivacy = document.getElementById("btnToggleCardPrivacy");
	const btnShowCardAgain = document.getElementById("btnShowCardAgain");
	const playerRoleCard = document.getElementById("playerRoleCard");
	const playerRoleHiddenCover = document.getElementById("playerRoleHiddenCover");

	btnToggleCardPrivacy.addEventListener("click", () => {
		playerRoleCard.classList.add("hidden");
		playerRoleHiddenCover.classList.remove("hidden");
		btnToggleCardPrivacy.classList.add("hidden");
	});

	btnShowCardAgain.addEventListener("click", () => {
		playerRoleCard.classList.remove("hidden");
		playerRoleHiddenCover.classList.add("hidden");
		btnToggleCardPrivacy.classList.remove("hidden");
	});

	// Create Room
	btnCreateRoom.addEventListener("click", async () => {
		const playerName = playerNameInput.value.trim();
		if (!playerName) {
			alert("Por favor, digite seu nome de agente!");
			return;
		}
		localStorage.setItem("playerName", playerName);

		try {
			btnCreateRoom.disabled = true;
			btnCreateRoom.textContent = "⏳ Criando Sala...";

			await multiplayerManager.init(playerName);
			const roomCode = multiplayerManager.createRoom();

			btnCreateRoom.disabled = false;
			btnCreateRoom.textContent = "🏠 Criar Sala (Host)";

			showScreen(hostScreen);
			displayRoomCode(roomCode);
			generateQRCode(roomCode);
			updateHostUI();
		} catch (error) {
			btnCreateRoom.disabled = false;
			btnCreateRoom.textContent = "🏠 Criar Sala (Host)";
			alert("Erro ao criar sala: " + error.message);
		}
	});

	// Go to Join Room Screen
	btnJoinRoom.addEventListener("click", () => {
		const playerName = playerNameInput.value.trim();
		if (!playerName) {
			alert("Por favor, digite seu nome antes de entrar na sala!");
			return;
		}
		localStorage.setItem("playerName", playerName);
		showScreen(joinScreen);
	});

	// Connect to Host Room
	btnConnect.addEventListener("click", async () => {
		const roomCode = roomCodeInput.value.trim();
		if (!roomCode) {
			alert("Por favor, digite ou cole o código da sala!");
			return;
		}

		const playerName = playerNameInput.value.trim() || "Agente";

		try {
			btnConnect.disabled = true;
			showJoinStatus("Inicializando comunicação criptografada...", "connecting");

			await multiplayerManager.init(playerName);
			showJoinStatus("Conectando à sala de operações...", "connecting");

			await multiplayerManager.joinRoom(roomCode);

			btnConnect.disabled = false;
			hideJoinStatus();

			showScreen(waitingRoom);
			document.getElementById("waitingRoomCode").textContent =
				multiplayerManager.roomCode;
			updateWaitingRoomUI();
		} catch (error) {
			btnConnect.disabled = false;
			showJoinStatus(error.message || "Falha ao conectar", "disconnected");
		}
	});

	btnBackFromJoin.addEventListener("click", () => {
		showScreen(selectionScreen);
		hideJoinStatus();
	});

	btnCancelRoom.addEventListener("click", () => {
		multiplayerManager.disconnect();
		showScreen(selectionScreen);
	});

	btnLeaveRoom.addEventListener("click", () => {
		multiplayerManager.disconnect();
		showScreen(selectionScreen);
	});

	btnStartGame.addEventListener("click", () => {
		showGameConfigModal();
	});

	btnBackToLobby.addEventListener("click", () => {
		if (multiplayerManager.isHost) {
			showScreen(hostScreen);
		} else {
			showScreen(waitingRoom);
		}
	});

	function showScreen(screen) {
		[
			selectionScreen,
			joinScreen,
			hostScreen,
			waitingRoom,
			roleRevealScreen,
		].forEach((s) => s.classList.add("hidden"));
		screen.classList.remove("hidden");
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	function showJoinStatus(message, type = "connecting") {
		const statusDiv = document.getElementById("joinStatus");
		statusDiv.classList.remove("hidden", "connecting", "connected", "disconnected");
		statusDiv.classList.add(type);
		statusDiv.innerHTML = `<p>${message}</p>`;
	}

	function hideJoinStatus() {
		document.getElementById("joinStatus").classList.add("hidden");
	}

	function displayRoomCode(code) {
		const normalizedCode = code.toLowerCase();
		const displayElement = document.getElementById("displayRoomCode");
		displayElement.textContent = normalizedCode;

		const btnCopy = document.getElementById("btnCopyCode");
		const btnShareLink = document.getElementById("btnShareLink");
		const copyFeedback = document.getElementById("copyFeedback");

		const copyText = async (text) => {
			try {
				if (navigator.clipboard && navigator.clipboard.writeText) {
					await navigator.clipboard.writeText(text);
				} else {
					const textarea = document.createElement("textarea");
					textarea.value = text;
					textarea.style.position = "fixed";
					textarea.style.opacity = "0";
					document.body.appendChild(textarea);
					textarea.select();
					document.execCommand("copy");
					document.body.removeChild(textarea);
				}
				if (copyFeedback) {
					copyFeedback.classList.add("show");
					setTimeout(() => copyFeedback.classList.remove("show"), 3000);
				}
			} catch (e) {
				alert("Código: " + text);
			}
		};

		btnCopy.onclick = () => copyText(normalizedCode);
		displayElement.onclick = () => copyText(normalizedCode);

		if (btnShareLink) {
			btnShareLink.onclick = () => {
				const joinURL = `${window.location.origin}${window.location.pathname}?join=${normalizedCode}`;
				copyText(joinURL);
			};
		}
	}

	function generateQRCode(roomCode) {
		const container = document.getElementById("qrCodeContainer");
		container.innerHTML = "";
		const normalizedCode = roomCode.toLowerCase();
		const joinURL = `${window.location.origin}${window.location.pathname}?join=${normalizedCode}`;

		try {
			const qrBox = document.createElement("div");
			qrBox.className = "qr-canvas-box";
			container.appendChild(qrBox);

			new QRCode(qrBox, {
				text: joinURL,
				width: 180,
				height: 180,
				colorDark: "#0b141a",
				colorLight: "#f4efe6",
				correctLevel: QRCode.CorrectLevel.M,
			});

			const label = document.createElement("p");
			label.textContent = "📱 Escaneie com a câmera para entrar direto na sala";
			container.appendChild(label);
		} catch (error) {
			console.error("Error generating QR code:", error);
		}
	}

	window.updateHostUI = function () {
		const playerList = document.getElementById("playerList");
		const playerCount = document.getElementById("playerCount");
		const btnStart = document.getElementById("btnStartGame");

		playerList.innerHTML = "";
		playerCount.textContent = multiplayerManager.getPlayerCount();
		btnStart.disabled = !multiplayerManager.canStartGame();

		multiplayerManager.players.forEach((player, idx) => {
			const li = document.createElement("li");
			li.className = `player-item ${player.isHost ? "host" : "ready"}`;
			li.innerHTML = `
				<span><strong>${player.name}</strong></span>
				<span class="status-badge ${player.isHost ? "host" : "ready"}">
					${player.isHost ? "👑 Host" : "✓ Conectado"}
				</span>
			`;
			playerList.appendChild(li);
		});
	};

	window.updateWaitingRoomUI = function () {
		const playerList = document.getElementById("waitingPlayerList");
		const playerCount = document.getElementById("waitingPlayerCount");

		playerList.innerHTML = "";
		playerCount.textContent = multiplayerManager.getPlayerCount();

		multiplayerManager.players.forEach((player) => {
			const li = document.createElement("li");
			li.className = `player-item ${player.isHost ? "host" : "ready"}`;
			li.innerHTML = `
				<span><strong>${player.name}</strong></span>
				<span class="status-badge ${player.isHost ? "host" : "ready"}">
					${player.isHost ? "👑 Host" : "✓ Conectado"}
				</span>
			`;
			playerList.appendChild(li);
		});
	};

	GameManager.applySavedTheme();

	window.addEventListener("resistanceThemeChanged", () => {
		if (multiplayerManager.myRole) {
			window.displayPlayerRole(multiplayerManager.myRole, false);
		}
		if (multiplayerManager.boardState && window.updateMultiplayerBoardUI) {
			window.updateMultiplayerBoardUI(false);
		}
	});

	// Display Player Role Card with full allies list & character tips!
	window.displayPlayerRole = function (role, isLoyaltySwapAlert = false) {
		const roleCard = document.getElementById("playerRoleCard");
		roleCard.classList.remove("hidden");
		playerRoleHiddenCover.classList.add("hidden");
		btnToggleCardPrivacy.classList.remove("hidden");

		const currentTheme = GameManager.getTheme();
		roleCard.className = "role-card " + role.faction;
		const bgImage = GameManager.getCardImageForRole(
			role,
			role.playerIndex || 0,
			currentTheme
		);
		roleCard.style.backgroundImage = `url('${bgImage}')`;

		const titleText =
			currentTheme === "fantasy" && role.fantasyTitle
				? role.fantasyTitle
				: role.displayName;

		// Build full allies & tactical tips HTML via shared GameManager method
		const detailsHTML = GameManager.buildRoleInfoHTML(role);

		roleCard.innerHTML = `
			<div class="role-header">
				<div class="player-badge" style="margin-bottom: 10px;">
					<span class="badge-label">Agente:</span>
					<span class="badge-number">${role.playerName || multiplayerManager.myPlayerName}</span>
				</div>
				<h2 class="role-title">${titleText}</h2>
				<div class="faction-badge ${role.faction}">
					${role.faction === "resistance" ? "Resistência" : "Espião"}
				</div>
			</div>
			<div class="role-info">
				${detailsHTML}
			</div>
		`;

		showScreen(roleRevealScreen);

		if (isLoyaltySwapAlert) {
			switchMpTab("role");
			alert(
				"🔄 TROCA DE LEALDADE! Uma carta de Troca de Lealdade do Desertor foi sorteada! Confira sua nova facção na sua carta!"
			);
		} else {
			switchMpTab("role");
		}
	};

	// Update Live Tactical Board & Online Voting UI
	window.updateMultiplayerBoardUI = function (autoNotifyTab = false) {
		const bs = multiplayerManager.boardState;
		if (!bs) return;

		if (autoNotifyTab && mpTabBoardContent.classList.contains("hidden")) {
			boardActionBadge.classList.remove("hidden");
		}

		// 1. Render shared Mini Tactical Board
		const boardMount = document.getElementById("mpTacticalBoardMount");
		const boardCtrl = new BoardUIController({
			container: boardMount,
			boardState: bs,
			roles: multiplayerManager.gameState
				? multiplayerManager.gameState.roles
				: null,
			mode: "multiplayer-client", // Use custom host panel below for online voting
		});
		boardCtrl.render();

		// 2. Render Live Interaction Box (Active Vote or Result for all players)
		renderLiveVoteInteractionBox(bs);

		// 3. Render Host Control Panel if Host
		const hostPanel = document.getElementById("mpHostControlsPanel");
		if (multiplayerManager.isHost) {
			hostPanel.classList.remove("hidden");
			renderHostControlPanel(hostPanel, bs);
		} else {
			hostPanel.classList.add("hidden");
		}
	};

	function renderLiveVoteInteractionBox(bs) {
		const box = document.getElementById("mpLiveInteractionBox");
		const session = multiplayerManager.isHost
			? multiplayerManager.getPublicVoteSession()
			: multiplayerManager.mpVoteSession;

		if (!session) {
			box.innerHTML = "";
			return;
		}

		const myPeerId = multiplayerManager.myPeerId;
		const hasVoted =
			session.votedPeerIds && session.votedPeerIds.includes(myPeerId);

		// CASE 1: Team Approval Vote
		if (session.type === "team_approval") {
			if (session.status === "voting") {
				box.innerHTML = `
					<div class="mp-vote-live-card">
						<span class="pass-badge">🗳️ VOTAÇÃO DE EQUIPE EM ANDAMENTO (MISSÃO ${session.round})</span>
						<h3>Equipe Proposta: ${session.teamNames.join(", ")}</h3>
						<p class="info-text">Votos computados: <strong>${session.votedPeerIds.length} / ${session.totalExpected}</strong></p>
						${
							hasVoted
								? `<div class="connection-status connected"><p>✅ Seu voto foi registrado! Aguardando os demais agentes...</p></div>`
								: `<div class="vote-cards-row">
										<button type="button" class="vote-card-btn approve" id="btnMpVoteApprove">
											<span class="vote-card-icon">✅</span>
											<span class="vote-card-title">APROVAR EQUIPE</span>
										</button>
										<button type="button" class="vote-card-btn reject" id="btnMpVoteReject">
											<span class="vote-card-icon">❌</span>
											<span class="vote-card-title">REJEITAR EQUIPE</span>
										</button>
								   </div>`
						}
					</div>
				`;

				if (!hasVoted) {
					document
						.getElementById("btnMpVoteApprove")
						.addEventListener("click", () =>
							multiplayerManager.submitVote("approve")
						);
					document
						.getElementById("btnMpVoteReject")
						.addEventListener("click", () =>
							multiplayerManager.submitVote("reject")
						);
				}
			} else if (session.status === "completed" && session.resultSummary) {
				const sum = session.resultSummary;
				box.innerHTML = `
					<div class="mp-vote-live-card">
						<div class="vote-tally-header ${sum.approved ? "approved" : "rejected"}">
							<h4>${sum.approved ? "✅ EQUIPE APROVADA!" : "❌ EQUIPE REJEITADA!"}</h4>
							<p>${sum.approvals} Aprovação(ões) × ${sum.rejections} Rejeição(ões)</p>
							<p style="margin-top:6px;font-weight:bold;">${sum.message}</p>
						</div>
						<ul class="team-votes-breakdown">
							${sum.breakdown
								.map(
									(b) => `
								<li class="${b.approved ? "v-app" : "v-rej"}">
									<span>${b.playerName}</span>
									<strong>${b.approved ? "✅ Aprovou" : "❌ Rejeitou"}</strong>
								</li>
							`
								)
								.join("")}
						</ul>
					</div>
				`;
			}
			return;
		}

		// CASE 2: Secret Mission Execution Vote
		if (session.type === "mission_execution") {
			const isOnMissionTeam =
				session.teamPeerIds && session.teamPeerIds.includes(myPeerId);

			if (session.status === "voting") {
				box.innerHTML = `
					<div class="mp-vote-live-card">
						<span class="pass-badge">🕵️ MISSÃO ${session.round} EM EXECUÇÃO SECRETA</span>
						<h3>Agentes em Missão: ${session.teamNames.join(", ")}</h3>
						<p class="info-text">Cartas secretas enviadas: <strong>${session.votedPeerIds.length} / ${session.totalExpected}</strong></p>
						${
							!isOnMissionTeam
								? `<div class="info-box"><p>⏳ Você não está escalado nesta missão. Aguarde os agentes escalados votarem secretamente.</p></div>`
								: hasVoted
								? `<div class="connection-status connected"><p>🔒 Sua carta secreta de missão foi enviada! Aguardando os demais integrantes...</p></div>`
								: `<div class="vote-cards-row">
										<button type="button" class="vote-card-btn success-card" id="btnMpMissionSuccess">
											<span class="vote-card-icon">🛡️</span>
											<span class="vote-card-title">SUCESSO</span>
											<span class="vote-card-sub">Cumprir a Missão</span>
										</button>
										<button type="button" class="vote-card-btn fail-card" id="btnMpMissionFail">
											<span class="vote-card-icon">🗡️</span>
											<span class="vote-card-title">SABOTAR</span>
											<span class="vote-card-sub">Falhar a Missão</span>
										</button>
								   </div>`
						}
					</div>
				`;

				if (isOnMissionTeam && !hasVoted) {
					document
						.getElementById("btnMpMissionSuccess")
						.addEventListener("click", () =>
							multiplayerManager.submitVote("success")
						);
					document
						.getElementById("btnMpMissionFail")
						.addEventListener("click", () =>
							multiplayerManager.submitVote("fail")
						);
				}
			} else if (session.status === "completed" && session.resultSummary) {
				const sum = session.resultSummary;
				box.innerHTML = `
					<div class="mp-vote-live-card">
						<h3>🎴 Resultado Anônimo da Missão ${session.round}</h3>
						<div class="revealed-cards-grid">
							${sum.shuffledCards
								.map(
									(v) => `
								<div class="revealed-mission-card ${v}">
									<span class="rm-icon">${v === "success" ? "🛡️" : "🗡️"}</span>
									<span class="rm-label">${v === "success" ? "SUCESSO" : "SABOTAGEM"}</span>
								</div>
							`
								)
								.join("")}
						</div>
						<div class="mission-verdict-banner ${sum.missionSucceeded ? "res" : "spy"}">
							<h4>${
								sum.missionSucceeded
									? "🛡️ MISSÃO CUMPRIDA! PONTO PARA A RESISTÊNCIA!"
									: "🗡️ MISSÃO SABOTADA! PONTO PARA OS ESPIÕES!"
							}</h4>
							<p>${sum.successCount} Sucesso(s) • ${sum.failsCount} Sabotagem(ns)</p>
						</div>
					</div>
				`;
			}
			return;
		}

		// CASE 3: Desertor Loyalty Card Alert
		if (session.type === "loyalty_alert" && session.loyaltyCard) {
			const card = session.loyaltyCard;
			const isSwap = card.type === "swap";
			box.innerHTML = `
				<div class="mp-vote-live-card loyalty-reveal-box ${isSwap ? "swap-alert" : "no-change"}">
					<span class="pass-badge">🃏 CARTA DO DESERTOR SORTEADA (RODADA ${card.round})</span>
					<div class="loyalty-card-visual ${isSwap ? "swap" : "keep"}">
						<div class="lc-icon">${isSwap ? "🔄" : "🛡️"}</div>
						<h3>${card.title}</h3>
						<p>${card.subtitle}</p>
					</div>
				</div>
			`;
		}
	}

	function renderHostControlPanel(container, bs) {
		if (bs.gameOver) {
			container.innerHTML = `
				<div class="board-phase-panel">
					<h3>👑 Controles do Host</h3>
					<button type="button" class="btn-secondary" id="btnMpHostResetBoard">
						🔄 Reiniciar Tabuleiro / Nova Partida
					</button>
				</div>
			`;
			document
				.getElementById("btnMpHostResetBoard")
				.addEventListener("click", () => {
					showGameConfigModal();
				});
			return;
		}

		const currentRoundObj = bs.rounds[bs.currentRound - 1] || bs.rounds[4];
		const requiredSize = currentRoundObj.teamSize;
		const playerPeers = bs.playerPeers || Array.from(multiplayerManager.players.values());

		// Prune invalid peers
		hostSelectedTeamPeers.forEach((id) => {
			if (!playerPeers.some((p) => p.peerId === id)) {
				hostSelectedTeamPeers.delete(id);
			}
		});

		container.innerHTML = `
			<div class="board-phase-panel host-mp-panel">
				<h3>👑 Painel do Host — Rodada ${bs.currentRound}</h3>
				<p class="info-text">Selecione os <strong>${requiredSize} agentes</strong> escalados pelo Líder para lançar a votação na tela de todos os celulares:</p>

				<div class="host-team-picker">
					${playerPeers
						.map((p) => {
							const isSelected = hostSelectedTeamPeers.has(p.peerId);
							return `
								<button type="button" class="team-pick-chip ${isSelected ? "selected" : ""}" data-pick-peer="${p.peerId}">
									<span>${isSelected ? "✅" : "⬜"} ${p.name}</span>
								</button>
							`;
						})
						.join("")}
				</div>

				<div class="action-buttons-row" style="margin-top: 15px;">
					<button type="button" class="btn-tactical approve" id="btnHostLaunchTeamVote" ${
						hostSelectedTeamPeers.size !== requiredSize ? "disabled" : ""
					}>
						🗳️ Enviar Votação de Equipe p/ Todos (${hostSelectedTeamPeers.size}/${requiredSize})
					</button>
					<button type="button" class="btn-primary" id="btnHostLaunchMissionVote" ${
						hostSelectedTeamPeers.size !== requiredSize ? "disabled" : ""
					}>
						🕵️ Enviar Votação Secreta da Missão (${hostSelectedTeamPeers.size}/${requiredSize})
					</button>
				</div>

				<div class="manual-outcome-row" style="margin-top: 15px;">
					<span class="manual-label">Atalhos Rápidos do Host (Mesa Física / Controle Direto):</span>
					<div class="manual-btns">
						<button type="button" class="btn-mini-outcome" id="btnHostNextLeader">⏭️ Passar Líder</button>
						<button type="button" class="btn-mini-outcome" id="btnHostQuickReject">❌ +1 Equipe Rejeitada (${bs.rejectedTeamsCount}/5)</button>
						<button type="button" class="btn-mini-outcome res" id="btnHostQuickRes">🛡️ Ponto Resistência</button>
						<button type="button" class="btn-mini-outcome spy" id="btnHostQuickSpy">🗡️ Ponto Espiões</button>
						${
							bs.hasDesertor
								? `<button type="button" class="btn-desertor-draw" id="btnHostDrawDesertor">🃏 Sortear Carta do Desertor</button>`
								: ""
						}
					</div>
				</div>
			</div>
		`;

		// Attach chip toggles
		container.querySelectorAll("[data-pick-peer]").forEach((chip) => {
			chip.addEventListener("click", () => {
				const pid = chip.dataset.pickPeer;
				if (hostSelectedTeamPeers.has(pid)) {
					hostSelectedTeamPeers.delete(pid);
				} else {
					if (hostSelectedTeamPeers.size >= requiredSize) {
						alert(`Esta missão exige exatamente ${requiredSize} integrantes.`);
						return;
					}
					hostSelectedTeamPeers.add(pid);
				}
				renderHostControlPanel(container, bs);
			});
		});

		const btnLaunchTeam = document.getElementById("btnHostLaunchTeamVote");
		if (btnLaunchTeam) {
			btnLaunchTeam.addEventListener("click", () => {
				multiplayerManager.startMultiplayerTeamApproval(
					Array.from(hostSelectedTeamPeers)
				);
			});
		}

		const btnLaunchMission = document.getElementById("btnHostLaunchMissionVote");
		if (btnLaunchMission) {
			btnLaunchMission.addEventListener("click", () => {
				multiplayerManager.startMultiplayerMissionVote(
					Array.from(hostSelectedTeamPeers)
				);
			});
		}

		document
			.getElementById("btnHostNextLeader")
			.addEventListener("click", () => {
				bs.leaderIndex = (bs.leaderIndex + 1) % bs.playerCount;
				multiplayerManager.broadcastBoardSync(false);
			});

		document
			.getElementById("btnHostQuickReject")
			.addEventListener("click", () => {
				GameManager.registerTeamVoteResult(bs, false);
				multiplayerManager.broadcastBoardSync(false);
			});

		document.getElementById("btnHostQuickRes").addEventListener("click", () => {
			GameManager.recordRoundOutcome(bs, "resistance", 0);
			hostSelectedTeamPeers.clear();
			multiplayerManager.broadcastBoardSync(false);
		});

		document.getElementById("btnHostQuickSpy").addEventListener("click", () => {
			GameManager.recordRoundOutcome(bs, "spy", 1);
			hostSelectedTeamPeers.clear();
			multiplayerManager.broadcastBoardSync(false);
		});

		const btnDesertor = document.getElementById("btnHostDrawDesertor");
		if (btnDesertor) {
			btnDesertor.addEventListener("click", () => {
				multiplayerManager.triggerMultiplayerDesertorDraw();
			});
		}
	}

	// Host Game Configuration Modal (Now includes all 7 special characters including Desertor + sub-options!)
	function showGameConfigModal() {
		const modal = document.createElement("div");
		modal.className = "tactical-modal-overlay";

		const playerCount = multiplayerManager.getPlayerCount();
		const spyCount = GameManager.getSpyCount(playerCount);
		const resCount = playerCount - spyCount;

		modal.innerHTML = `
			<div class="tactical-modal-card">
				<h2>⚙️ Configurar Partida (${playerCount} Agentes)</h2>
				<p class="info-text">Composição: <strong>${resCount} Resistência</strong> vs <strong>${spyCount} Espiões</strong>. Selecione os personagens especiais:</p>

				<div class="characters-grid" style="margin: 15px 0;">
					<label class="character-option resistance">
						<input type="checkbox" value="comandante" checked>
						<div class="character-card">
							<h3>👑 Comandante</h3>
							<span class="faction">Resistência</span>
							<p>Conhece todos os espiões (exceto Agente Invisível)</p>
						</div>
					</label>

					<label class="character-option resistance">
						<input type="checkbox" value="guardacostas">
						<div class="character-card">
							<h3>🛡️ Guarda-Costas</h3>
							<span class="faction">Resistência</span>
							<p>Conhece quem é o Comandante (e Comandante Falso)</p>
						</div>
					</label>

					<label class="character-option spy">
						<input type="checkbox" value="assassino" checked>
						<div class="character-card">
							<h3>🗡️ Assassino</h3>
							<span class="faction">Espião</span>
							<p>Pode eliminar o Comandante caso a Resistência vença 3 missões</p>
						</div>
					</label>

					<label class="character-option spy">
						<input type="checkbox" value="espiaocego">
						<div class="character-card">
							<h3>👁️ Espião Cego</h3>
							<span class="faction">Espião</span>
							<p>Não conhece os outros espiões, mas é visto pelo Comandante</p>
						</div>
					</label>

					<label class="character-option spy">
						<input type="checkbox" value="agenteinvisivel">
						<div class="character-card">
							<h3>👻 Agente Invisível</h3>
							<span class="faction">Espião</span>
							<p>Invisível ao Comandante, mas conhece os outros espiões</p>
						</div>
					</label>

					<label class="character-option spy">
						<input type="checkbox" value="comandantefalso">
						<div class="character-card">
							<h3>👹 Comandante Falso</h3>
							<span class="faction">Espião</span>
							<p>Aparece como Comandante para o Guarda-Costas</p>
						</div>
					</label>

					<label class="character-option neutral">
						<input type="checkbox" value="desertor" id="mpModalDesertorCheck">
						<div class="character-card">
							<h3>🔄 Desertor (Par)</h3>
							<span class="faction">Ambas Facções</span>
							<p>1 Resistência + 1 Espião que podem trocar de lado a partir da 3ª rodada</p>
						</div>
					</label>
				</div>

				<div class="special-options">
					<label class="radio-option" style="margin-bottom:8px;">
						<input type="checkbox" id="mpOptCmdFalsoKnows">
						<span>Comandante Falso conhece os outros espiões (Variante)</span>
					</label>
					<label class="radio-option">
						<input type="checkbox" id="mpOptDesertoresKnow">
						<span>Desertores se conhecem desde o início</span>
					</label>
				</div>

				<div class="btn-group" style="margin-top: 20px;">
					<button type="button" class="btn-secondary" id="modalCancelBtn">Cancelar</button>
					<button type="button" class="btn-primary" id="modalStartBtn">🚀 Distribuir Cartas & Iniciar</button>
				</div>
			</div>
		`;

		document.body.appendChild(modal);

		modal.querySelector("#modalCancelBtn").addEventListener("click", () => {
			document.body.removeChild(modal);
		});

		modal.querySelector("#modalStartBtn").addEventListener("click", () => {
			const checked = Array.from(
				modal.querySelectorAll('.characters-grid input[type="checkbox"]:checked')
			).map((cb) => cb.value);

			const config = {
				selectedSpecials: checked,
				options: {
					comandanteFalsoKnows: modal.querySelector("#mpOptCmdFalsoKnows").checked,
					desertoresKnowEachOther: modal.querySelector("#mpOptDesertoresKnow").checked,
				},
			};

			hostSelectedTeamPeers.clear();
			multiplayerManager.startGame(config);
			document.body.removeChild(modal);
		});
	}

	// Auto-fill join code if present in URL (?join=...)
	const urlParams = new URLSearchParams(window.location.search);
	const joinCode = urlParams.get("join");
	if (joinCode) {
		roomCodeInput.value = joinCode.toLowerCase();
		if (playerNameInput.value.trim()) {
			showScreen(joinScreen);
		}
	}
});
