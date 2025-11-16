// ===================================
// KONEKSI MULTIPLAYER (WAJIB)
// ===================================
// Ganti "localhost:3000" jika server Anda ada di tempat lain
const socket = io("https://1d67e2d6-314c-43b7-abc3-9929091dc668-00-3he8ktgy5edn4.sisko.replit.dev");

// Saat berhasil terhubung
socket.on('connect', () => {
    console.log(`Terhubung ke server dengan ID: ${socket.id}`);
});

// ===================================
// INISIALISASI ELEMEN (DOM)
// ===================================
// (Sama, tidak berubah)
const screens = document.querySelectorAll('.screen');
const mainMenu = document.getElementById('main-menu');
// const botSetup = document.getElementById('bot-setup'); // (Dihapus)
const gameBoard = document.getElementById('game-board');
const btnPlayBot = document.getElementById('btn-play-bot');
// const btnStartGame = document.getElementById('btn-start-game'); // (Dihapus)
// const btnBackToMenu = document.getElementById('btn-back-to-menu'); // (Dihapus)
const btnSortCards = document.getElementById('btn-sort-cards');
const btnPlayCard = document.getElementById('btn-play-card');
const btnSkipTurn = document.getElementById('btn-skip-turn');
// const selectDifficulty = document.getElementById('select-difficulty'); // (Dihapus)
// const selectPlayerCount = document.getElementById('select-player-count'); // (Dihapus)
const playerHandElement = document.getElementById('player-hand');
const bot1HandElement = document.getElementById('bot-1-hand');
const bot2HandElement = document.getElementById('bot-2-hand');
const bot3HandElement = document.getElementById('bot-3-hand');
const bot3ContainerElement = document.getElementById('bot-3-container');
const discardPileCardElement = document.getElementById('discard-pile-card');
const gameStatusElement = document.getElementById('current-player-status');
const playPileElement = document.getElementById('play-pile');
const hintControlsElement = document.getElementById('hint-controls');
const playerCardCount = document.getElementById('player-card-count');
const bot1CardCount = document.getElementById('bot-1-card-count');
const bot2CardCount = document.getElementById('bot-2-card-count');
const bot3CardCount = document.getElementById('bot-3-card-count');
const btnResetSort = document.getElementById('btn-reset-sort');
const btnHintPair = document.getElementById('btn-hint-pair');
const btnHintCombo = document.getElementById('btn-hint-combo');
const hintComboCountElement = document.getElementById('hint-combo-count');
const btnInGameMenu = document.getElementById('btn-in-game-menu');
const inGameMenuOverlay = document.getElementById('in-game-menu-overlay');
const btnMenuBack = document.getElementById('btn-menu-back');
const btnMenuRules = document.getElementById('btn-menu-rules');
// const btnMenuRestart = document.getElementById('btn-menu-restart'); // (Dihapus)
const btnMenuMain = document.getElementById('btn-menu-main');
const endGameScreen = document.getElementById('end-game-screen');
const endGameResultsElement = document.getElementById('end-game-results');
const btnPlayAgain = document.getElementById('btn-play-again');
const btnEndGameMainMenu = document.getElementById('btn-end-game-main-menu');
const btnKomboChance = document.getElementById('btn-kombo-chance');
const komboChanceCountElement = document.getElementById('kombo-chance-count');
const btnUnselect = document.getElementById('btn-unselect');
const btnPlayMultiplayer = document.getElementById('btn-play-multiplayer');

const botSetup = document.getElementById('bot-setup');
const btnStartGame = document.getElementById('btn-start-game');
const btnBackToMenu = document.getElementById('btn-back-to-menu');
const selectDifficulty = document.getElementById('select-difficulty');
const selectPlayerCount = document.getElementById('select-player-count');

// Screen & Tombol Multiplayer Menu
const multiplayerMenu = document.getElementById('multiplayer-menu');
const btnCreateRoom = document.getElementById('btn-create-room');
const btnJoinRoom = document.getElementById('btn-join-room');
const inputJoinRoom = document.getElementById('input-join-room');
const btnBackToMainMenu = document.getElementById('btn-back-to-main-menu');

const adu3Modal = document.getElementById('adu3-modal-overlay');
const adu3ModalText = document.getElementById('adu3-modal-text');
const adu3BtnOk = document.getElementById('adu3-btn-ok');

// Screen & Elemen Lobi
const roomLobby = document.getElementById('room-lobby');
const lobbyRoomId = document.getElementById('lobby-room-id');
const lobbyPlayerSlots = document.getElementById('lobby-player-slots');
const lobbyBtnLeave = document.getElementById('lobby-btn-leave');
const lobbyBtnShareLink = document.getElementById('lobby-btn-share-link');
const lobbyBtnReady = document.getElementById('lobby-btn-ready');
const lobbyBtnStartGame = document.getElementById('lobby-btn-start-game');
const lobbySettingsRight = document.getElementById('lobby-right');

// ===================================
// KONFIGURASI GAME (UNTUK UI)
// ===================================
const RANKS = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
const SUITS = ['diamond', 'club', 'heart', 'spade'];
const RANK_VALUES = {};
RANKS.forEach((rank, index) => { RANK_VALUES[rank] = index; });
const SUIT_VALUES = {};
SUITS.forEach((suit, index) => { SUIT_VALUES[suit] = index; });
const HIGH_CARD_CUTOFF = RANK_VALUES['Q'] * 4;
const HIGH_CARD_CUTOFF_HARD = RANK_VALUES['J'] * 4;

// ===================================
// GLOBAL GAME STATE (CLIENT-SIDE)
// ===================================
let gameState = {}; // State utama sekarang DIKIRIM OLEH SERVER
let sortableInstance = null;
let isSortMode = false;
let hintPairState = { index: 0, hints: [] };
let hintComboState = { index: 0, hints: [] };
let komboChanceState = { index: 0, hints: [] };
let isGameActive = false;
let currentRoomState = null;
let adu3TimerInterval = null;
let globalTurnTimerInterval = null;
let postGameTimerInterval = null;
// Hapus: isMultiplayerMode (sekarang semua adalah multiplayer)
// Hapus: lastGameWinnerIndex (diurus server)
// Hapus: GAME_STATE_KEY (tidak ada localStorage)

// ===================================
// FUNGSI LOGIKA KOMBO (OTAK UTAMA UI)
// ===================================
// (Fungsi-fungsi ini DIJAGA untuk validasi UI & Hint Engine)
function getRankCounts(cards) {
    const counts = {};
    for (const card of cards) { counts[card.rank] = (counts[card.rank] || 0) + 1; }
    return counts;
}
function isStraight(cards) {
    if (cards.length < 3) return false;
    for (let i = 1; i < cards.length; i++) {
        if (cards[i].rankValue !== cards[i - 1].rankValue + 1) { return false; }
    }
    return true;
}
function isFlush(cards) {
    if (cards.length === 0) return false;
    const suit = cards[0].suit;
    return cards.every(card => card.suit === suit);
}
function isSeri(cards) {
    if (cards.length !== 3) return false;
    return isStraight(cards) && isFlush(cards);
}
function getComboDetails(cards) {
    if (!cards || cards.length === 0) return { type: 'invalid' };
    cards.sort((a, b) => a.value - b.value);
    const len = cards.length;
    const counts = getRankCounts(cards);
    const ranks = Object.keys(counts);
    if (len === 5) {
        const straight = isStraight(cards);
        const flush = isFlush(cards);
        const highCard = cards[len - 1];
        if (straight && flush) {
            return { type: 'straight-flush', value: highCard.value, cards: cards, isBomb: true };
        }
        if (ranks.length === 2 && (counts[ranks[0]] === 3 || counts[ranks[1]] === 3)) {
            const trisRank = (counts[ranks[0]] === 3) ? ranks[0] : ranks[1];
            const trisHighCard = cards.findLast(c => c.rank === trisRank);
            return { type: 'full-house', value: trisHighCard.value, cards: cards };
        }
        if (flush) {
            return { type: 'flush', value: highCard.value, cards: cards };
        }
        if (straight) {
            return { type: 'straight', value: highCard.value, cards: cards };
        }
        
        let pairRank = null;
        for (const rank in counts) {
            if (counts[rank] === 2) { pairRank = rank; break; }
        }
        if (pairRank) {
            const otherCards = cards.filter(c => c.rank !== pairRank);
            if (isSeri(otherCards)) {
                return { type: 'seri-buntut', value: otherCards[2].value, cards: cards };
            }
        }

        let trisRank = null;
        for (const rank in counts) {
            if (counts[rank] === 3) { trisRank = rank; break; }
        }
        if (trisRank) {
            const sisaCards = cards.filter(c => c.rank !== trisRank); 
            const trisCards = cards.filter(c => c.rank === trisRank); 
            for (const trisCard of trisCards) {
                const potentialSeri = [...sisaCards, trisCard];
                potentialSeri.sort((a,b) => a.value - b.value);
                if (isSeri(potentialSeri)) {
                    return { type: 'seri-buntut', value: potentialSeri[2].value, cards: cards };
                }
            }
        }
    }
    if (len === 4) {
        if (ranks.length === 1) {
            return { type: '4-of-a-kind', value: cards[3].value, cards: cards, isBomb: true };
        }
        if (ranks.length === 2 && counts[ranks[0]] === 2 && counts[ranks[1]] === 2) {
            const rankVal1 = RANK_VALUES[ranks[0]];
            const rankVal2 = RANK_VALUES[ranks[1]];
            if (Math.abs(rankVal1 - rankVal2) === 1) {
                return { type: 'bro-sis', value: cards[3].value, cards: cards };
            }
        }
    }
    if (len === 3) {
        if (ranks.length === 1) {
            return { type: 'tris', value: cards[2].value, cards: cards };
        }
        if (isStraight(cards) && isFlush(cards)) {
            return { type: 'seri', value: cards[2].value, cards: cards };
        }
    }
    if (len === 2) {
        if (ranks.length === 1) {
            return { type: '1-pair', value: cards[1].value, cards: cards };
        }
    }
    if (len === 1) {
        return { type: 'one-card', value: cards[0].value, cards: cards };
    }
    return { type: 'invalid' };
}

// ===================================
// FUNGSI LOGIKA HINT (UNTUK UI)
// ===================================
// (Fungsi-fungsi ini DIJAGA untuk Hint Engine)

function findPossibleCounters(hand, pileCombo) {
    const possiblePlays = [];
    const n = hand.length;
    const pileType = pileCombo.type;
    const pileValue = pileCombo.value;

    const isPileSingleTwo = (
        pileType === 'one-card' &&
        pileCombo.cards[0].rank === '2'
    );

    if (isPileSingleTwo) {
        const allCombos = findAllOpeningCombos(hand);
        const allBombs = allCombos.filter(c =>
            c.type === '4-of-a-kind' || c.type === 'straight-flush'
        );
        if (allBombs.length > 0) {
            allBombs.sort((a, b) => a.value - b.value);
            return allBombs;
        }
    }

    const comboLength = pileCombo.cards.length;

    function findCombinations(startIndex, currentCombo) {
        if (currentCombo.length === comboLength) {
            const combo = getComboDetails([...currentCombo]);
            if (combo.type === 'invalid') {
                return;
            }

            let isValidPlay = false;
            const pileRank = COMBO_5_CARD_RANKS[pileCombo.type];
            const newRank = COMBO_5_CARD_RANKS[combo.type];

            if (combo.cards.length === 5 && pileCombo.cards.length === 5 && newRank && pileRank) {
                if (newRank > pileRank) {
                    isValidPlay = true;
                } else if (newRank === pileRank && combo.value > pileValue) {
                    isValidPlay = true;
                }
            } else if (combo.type === pileType && combo.value > pileValue) {
                isValidPlay = true;
            }

            if (isValidPlay) {
                possiblePlays.push(combo);
            }
            return;
        }
        for (let i = startIndex; i < n; i++) {
            currentCombo.push(hand[i]);
            findCombinations(i + 1, currentCombo);
            currentCombo.pop();
        }
    }
    
    findCombinations(0, []);
    possiblePlays.sort((a, b) => a.value - b.value);
    return possiblePlays;
}

function findAllOpeningCombos(hand) {
    const allCombos = [];
    const n = hand.length;

    // 1. Cari semua 1-card
    for (let i = 0; i < n; i++) {
        allCombos.push(getComboDetails([hand[i]]));
    }
    // 2. Cari semua 1-pair
    for (let i = 0; i < n - 1; i++) {
        if (hand[i].rank === hand[i+1].rank) {
            allCombos.push(getComboDetails([hand[i], hand[i+1]]));
        }
    }
    // 3. Cari semua 3-card (Tris DAN Seri)
    for (let i = 0; i < n - 2; i++) {
        if (hand[i].rank === hand[i+1].rank && hand[i+1].rank === hand[i+2].rank) {
            allCombos.push(getComboDetails([hand[i], hand[i+1], hand[i+2]]));
        }
    }
    if (n >= 3) {
        function find3CardCombinations(startIndex, currentCombo) {
            if (currentCombo.length === 3) {
                const combo = getComboDetails([...currentCombo]);
                if (combo.type === 'seri') {
                    allCombos.push(combo);
                }
                return;
            }
            if (startIndex >= n) return;
            for (let i = startIndex; i < n; i++) {
                currentCombo.push(hand[i]);
                find3CardCombinations(i + 1, currentCombo);
                currentCombo.pop();
            }
        }
        find3CardCombinations(0, []);
    }

    // 4. Cari semua 4-card (4-of-a-kind DAN Bro-sis)
    for (let i = 0; i < n - 3; i++) {
        if (hand[i].rank === hand[i+1].rank && hand[i+1].rank === hand[i+2].rank && hand[i+2].rank === hand[i+3].rank) {
            allCombos.push(getComboDetails([hand[i], hand[i+1], hand[i+2], hand[i+3]]));
        }
    }
    if (n >= 4) {
        function find4CardCombinations(startIndex, currentCombo) {
            if (currentCombo.length === 4) {
                const combo = getComboDetails([...currentCombo]);
                if (combo.type === 'bro-sis') {
                    allCombos.push(combo);
                }
                return;
            }
            if (startIndex >= n) return;
            for (let i = startIndex; i < n; i++) {
                currentCombo.push(hand[i]);
                find4CardCombinations(i + 1, currentCombo);
                currentCombo.pop();
            }
        }
        find4CardCombinations(0, []);
    }
    
    // 5. Cari semua 5-card (Termasuk 'Seri-buntut')
    if (n >= 5) {
        function find5CardCombinations(startIndex, currentCombo) {
            if (currentCombo.length === 5) {
                const combo = getComboDetails([...currentCombo]);
                if (combo.type === 'straight' || combo.type === 'flush' || 
                    combo.type === 'full-house' || combo.type === 'straight-flush' ||
                    combo.type === 'seri-buntut') {
                    allCombos.push(combo);
                }
                return;
            }
            if (startIndex >= n) return;
            const limit = Math.min(startIndex + (n - startIndex), n); 
            for (let i = startIndex; i < limit; i++) {
                if (allCombos.length > 50) break;
                currentCombo.push(hand[i]);
                find5CardCombinations(i + 1, currentCombo);
                currentCombo.pop();
            }
        }
        find5CardCombinations(0, []);
    }
    
    // 6. Saring & Hapus Duplikat
    const validCombos = allCombos.filter(c => c.type !== 'invalid');
    const uniqueCombos = [];
    const seenCombos = new Set();
    for (const combo of validCombos) {
        const comboId = combo.cards.map(c => c.id).join(',');
        if (!seenCombos.has(comboId)) {
            seenCombos.add(comboId);
            uniqueCombos.push(combo);
        }
    }
    uniqueCombos.sort((a, b) => a.value - b.value);
    return uniqueCombos;
}


// ===================================
// FUNGSI AKSI (Jalan, Skip, Giliran)
// ===================================
// (SEMUA LOGIKA GAME DARI SINI DIHAPUS)
// - runBotTurn() -> HAPUS
// - playCards() -> HAPUS
// - handleBombWin() -> HAPUS
// - skipTurn() -> HAPUS
// - nextTurn() -> HAPUS


// ===================================
// FUNGSI TAMPILAN (RENDER)
// ===================================
// (Fungsi-fungsi ini DIJAGA)

/**
 * BARU: Merender papan game untuk Multiplayer (menggantikan startNewGame)
 * (Dipanggil setelah menerima data dari server)
 */
function renderMultiplayerGame(myHand, showStatus = true) {
    isGameActive = true; 

    // --- PERBAIKAN BUG DIMULAI DI SINI ---
    // Selalu nonaktifkan tombol saat game baru dimulai/dirender.
    // Tombol ini HANYA akan aktif jika server mengirim 'yourTurn'.
    btnPlayCard.disabled = true;
    btnSkipTurn.disabled = true;
    setButtonState('neutral'); // Set tombol ke status netral (merah/hijau)
    // --- AKHIR PERBAIKAN ---

    
    // 1. Atur Ulang Papan
    gameState.currentPlayPile = [];
    playPileElement.innerHTML = '';
    
    if (gameState.discardPile) {
        discardPileCardElement.classList.remove('hidden');
        discardPileCardElement.innerHTML = createCardBackHTML();
    } else {
        discardPileCardElement.classList.add('hidden');
    }

    gameBoard.classList.remove('players-3', 'players-4');
    if (gameState.settings.maxPlayers === 3) {
        gameBoard.classList.add('players-3');
    } else {
        gameBoard.classList.add('players-4');
    }

    // 2. Render Tangan Kita (Player 0)
    playerHandElement.innerHTML = '';
    myHand.forEach(card => {
        playerHandElement.innerHTML += createCardElement(card);
    });
    addCardClickListeners();
    playerCardCount.textContent = myHand.length;

    // 3. Render Pemain Lain (Nama & Card Count)
    const playerSlots = [
        { label: 'player-label', count: 'player-card-count', handEl: playerHandElement },
        { label: 'bot-1-label', count: 'bot-1-card-count', handEl: bot1HandElement },
        { label: 'bot-2-label', count: 'bot-2-card-count', handEl: bot2HandElement },
        { label: 'bot-3-label', count: 'bot-3-card-count', handEl: bot3HandElement }
    ];

    const myServerIndex = gameState.players.findIndex(p => p.id === socket.id);
    
    for (let i = 0; i < gameState.settings.maxPlayers; i++) {
        let uiIndex = (i - myServerIndex + gameState.settings.maxPlayers) % gameState.settings.maxPlayers;
        const slot = playerSlots[uiIndex];
        const playerData = gameState.players[i];
        document.getElementById(slot.label).textContent = playerData.name + (uiIndex === 0 ? " (Anda)" : "");
        document.getElementById(slot.count).textContent = playerData.cardCount;
        if (uiIndex !== 0) {
            slot.handEl.innerHTML = '';
            for (let j = 0; j < playerData.cardCount; j++) {
                slot.handEl.innerHTML += createCardBackHTML();
            }
        }
    }
    
    if (gameState.settings.maxPlayers === 3) {
        bot3ContainerElement.classList.add('hidden');
    } else {
        bot3ContainerElement.classList.remove('hidden');
    }

    // 4. Inisialisasi Ulang Tombol & Sortable
    if (sortableInstance) sortableInstance.destroy();
    sortableInstance = new Sortable(playerHandElement, {
        animation: 150, disabled: true,
        onEnd: (evt) => updateHandOrderFromDOM()
    });
    isSortMode = false;
    btnSortCards.textContent = "Susun Kartu";
    btnSortCards.style.backgroundColor = "";

    btnHintPair.classList.add('hidden');
    btnHintCombo.classList.add('hidden');
    if (gameState.settings.hintPair) {
        btnHintPair.classList.remove('hidden');
    }
    if (gameState.settings.hintCombo) {
        btnHintCombo.classList.remove('hidden');
    }
    
    // 5. Pindah Layar
    switchScreen('game-board');

    // 6. Atur Teks Status
    if (showStatus) {
        updateGameStatus(gameState.statusText);
    } else {
        // Teks untuk modal Adu 3
        const startingPlayerIndex = gameState.currentPlayerIndex;
        const startingPlayer = gameState.players[startingPlayerIndex];
        let playerName = startingPlayer.name;
        if (startingPlayerIndex === myServerIndex) {
            playerName = "Anda";
        }
        updateGameStatus(`Permainan dimulai oleh ${playerName}`);
    }
}
// (renderHands() LOKAL tidak diperlukan lagi, renderMultiplayerGame/gameStateUpdate sudah menanganinya)

function renderPlayPile() {
    playPileElement.innerHTML = '';
    // (Logika discard pile sisa 3 pemain, bisa ditangani di server)
    if (gameState.discardPile && gameState.playerCount === 3 && gameState.currentPlayPile.length === 0) {
        discardPileCardElement.classList.remove('hidden');
        discardPileCardElement.innerHTML = createCardBackHTML();
        playPileElement.appendChild(discardPileCardElement);
    }
    gameState.currentPlayPile.forEach(card => {
        playPileElement.innerHTML += createCardElement(card);
    });
}

function renderRevealedHand(handElement, cards) {
    handElement.innerHTML = ''; // Kosongkan
    
    if (!cards || cards.length === 0) {
        return;
    }

    const maxVisibleCards = 5;

    // 1. Sortir kartu dari TERTINGGI ke TERENDAH
    const sortedCards = [...cards].sort((a, b) => b.value - a.value); 

    // 2. Pisahkan 5 kartu tertinggi dari sisanya
    const visibleCards = sortedCards.slice(0, maxVisibleCards);
    const hiddenCardCount = sortedCards.length - visibleCards.length;

    // 3. Render tumpukan sisa (jika ada) PERTAMA
    if (hiddenCardCount > 0) {
        handElement.innerHTML += createStackedCardBackHTML(hiddenCardCount);
    }

    // 4. Render 5 kartu tertinggi KEDUA
    visibleCards.forEach(card => {
        handElement.innerHTML += createMiniCardElement(card);
    });
}
/**
 * Membersihkan timer giliran visual (jika ada)
 */
function clearVisualTimer() {
    if (globalTurnTimerInterval) {
        clearInterval(globalTurnTimerInterval);
        globalTurnTimerInterval = null;
    }
}

/**
 * Memulai countdown visual di status bar
 * @param {string} baseText Teks dasar (misal "Giliran Anda" atau "Jeda Susun")
 * @param {number} duration Detik
 */
function startVisualTimer(baseText, duration) {
    clearVisualTimer(); // Hapus timer lama
    
    if (duration <= 0) {
        // Tidak ada timer, set teks saja
        updateGameStatus(baseText);
        return;
    }
    
    let countdown = duration;
    updateGameStatus(`${baseText} (${countdown}s)`); // Tampilan awal
    
    globalTurnTimerInterval = setInterval(() => {
        countdown--;
        updateGameStatus(`${baseText} (${countdown}s)`);
        
        if (countdown <= 0) {
            clearVisualTimer();
            // (Server akan menangani auto-skip dan mengirim gameStateUpdate baru)
            // (Kita bisa tambahkan "Menunggu server..." jika mau)
            updateGameStatus(`${baseText} (0s)`);
        }
    }, 1000);
}

function startPostGameVisualTimer(duration) {
    if (postGameTimerInterval) {
        clearInterval(postGameTimerInterval);
    }
    
    let countdown = duration;
    btnPlayAgain.textContent = `Main Lagi (${countdown}s)`;
    btnPlayAgain.disabled = false; // Pastikan tombol aktif (tapi diklik tidak ada aksi)

    postGameTimerInterval = setInterval(() => {
        countdown--;
        btnPlayAgain.textContent = `Main Lagi (${countdown}s)`;
        
        if (countdown <= 0) {
            clearInterval(postGameTimerInterval);
            postGameTimerInterval = null;
            btnPlayAgain.textContent = "Memulai...";
            btnPlayAgain.disabled = true;
        }
    }, 1000);
}

function createCardElement(card) {
    const suitSymbols = { 'diamond': '♦', 'club': '♣', 'heart': '♥', 'spade': '♠' };
    const color = (card.suit === 'diamond' || card.suit === 'heart') ? 'red' : 'black';
    return `
        <div class="card ${color}" data-id="${card.id}" data-value="${card.value}">
            <span class="rank">${card.rank}</span>
            <span class="suit">${suitSymbols[card.suit]}</span>
            <span class="rank-bottom">${card.rank}</span>
        </div>
    `;
}

function createMiniCardElement(card) {
    const suitSymbols = { 'diamond': '♦', 'club': '♣', 'heart': '♥', 'spade': '♠' };
    const color = (card.suit === 'diamond' || card.suit === 'heart') ? 'red' : 'black';
    
    // HTML yang lebih simpel dengan class 'mini-card'
    return `
        <div class="mini-card ${color}">
            <span class="rank">${card.rank}</span>
            <span class="suit">${suitSymbols[card.suit]}</span>
        </div>
    `;
}

function createStackedCardBackHTML(count) {
    // HANYA 'stacked-pile'. Ini menghindari konflik CSS.
    return `
        <div class="stacked-pile"> 
            <span>+${count}</span>
        </div>
    `;
}

function createCardBackHTML() {
    return `<div class="card-back"></div>`;
}
function addCardClickListeners() {
    const cards = playerHandElement.querySelectorAll('.card');
    cards.forEach(cardElement => {
        cardElement.addEventListener('click', () => {
            cardElement.classList.toggle('selected');
            validatePlayerSelection();
            updateUnselectButtonState();
        });
    });
}
function sortPlayerHand() {
    // (Fungsi ini sekarang hanya untuk tombol 'Reset Sort')
    gameState.playerHands[0].sort((a, b) => a.value - b.value);
    
    // Render ulang tangan LOKAL
    playerHandElement.innerHTML = '';
    gameState.playerHands[0].forEach(card => {
        playerHandElement.innerHTML += createCardElement(card);
    });
    addCardClickListeners();
}
function updateHandOrderFromDOM() {
    console.log("Menyimpan urutan kartu baru (lokal)...");
    const cardElements = playerHandElement.querySelectorAll('.card');
    const newHandOrder = [];
    
    cardElements.forEach(cardEl => {
        const cardId = cardEl.getAttribute('data-id');
        const cardData = gameState.playerHands[0].find(c => c.id === cardId);
        if (cardData) {
            newHandOrder.push(cardData);
        }
    });
    // Ganti array lama di gameState dengan array baru yang sudah terurut
    gameState.playerHands[0] = newHandOrder;
    // (Tidak perlu saveGameState() lagi)
}
function switchScreen(screenId) {
    screens.forEach(screen => {
        if (screen.id === screenId) {
            screen.classList.add('active');
            screen.classList.remove('hidden');
        } else {
            screen.classList.add('hidden');
            screen.classList.remove('active');
        }
    });
}
function updateGameStatus(text) {
    gameStatusElement.textContent = text;
}


// ===================================
// EVENT LISTENERS UTAMA (REFAKTOR)
// ===================================


btnPlayBot.addEventListener('click', () => {
    switchScreen('bot-setup');
});

btnBackToMenu.addEventListener('click', () => {
    switchScreen('main-menu');
});

btnStartGame.addEventListener('click', () => {
    const difficulty = selectDifficulty.value;
    const maxPlayers = parseInt(selectPlayerCount.value, 10);

    console.log(`Mengirim 'createBotGame' (Difficulty: ${difficulty}, Pemain: ${maxPlayers})`);
    
    // Kirim event baru ke server dengan konfigurasi yang dipilih
    socket.emit('createBotGame', {
        difficulty: difficulty,
        maxPlayers: maxPlayers
    });
    
    // Server akan merespon dengan 'gameStarted'
    // yang akan otomatis memindahkan layar ke 'game-board'
});

btnInGameMenu.addEventListener('click', () => {
    inGameMenuOverlay.classList.remove('hidden');
    inGameMenuOverlay.classList.add('active');
});

btnMenuBack.addEventListener('click', () => {
    inGameMenuOverlay.classList.add('hidden');
    inGameMenuOverlay.classList.remove('active');
});

btnMenuRules.addEventListener('click', () => {
    window.open('https://sauqing9.github.io/poker-rules/', '_blank');
});

// Tombol "Main Menu" -> Reload halaman
btnMenuMain.addEventListener('click', () => {
    // Cara terbersih untuk reset state & socket
    window.location.reload(); 
});

adu3BtnOk.addEventListener('click', closeAdu3Modal);

// btnMenuRestart.addEventListener('click', ...); // (Dihapus)
// btnStartGame.addEventListener('click', ...); // (Dihapus)

// ===================================
// EVENT LISTENERS MULTIPLAYER (LOBI)
// ===================================

btnPlayMultiplayer.addEventListener('click', () => {
    switchScreen('multiplayer-menu');
});

btnBackToMainMenu.addEventListener('click', () => {
    switchScreen('main-menu');
});

btnCreateRoom.addEventListener('click', () => {
    console.log("Mengirim permintaan 'createRoom'...");
    socket.emit('createRoom');
});

btnJoinRoom.addEventListener('click', () => {
    const roomId = inputJoinRoom.value.toUpperCase();
    if (roomId.length !== 4) {
        return alert("Kode Room harus 4 digit.");
    }
    console.log(`Mengirim permintaan 'joinRoom' untuk ${roomId}...`);
    socket.emit('joinRoom', { roomId: roomId });
});

// Tombol "Keluar Room" -> Reload halaman
lobbyBtnLeave.addEventListener('click', () => {
    window.location.reload();
});

lobbyBtnShareLink.addEventListener('click', () => {
    if (currentRoomState) {
        navigator.clipboard.writeText(currentRoomState.id).then(() => {
            alert(`Kode Room ${currentRoomState.id} disalin!`);
        }, () => {
            alert(`Kode Room: ${currentRoomState.id}`);
        });
    }
});

lobbyBtnReady.addEventListener('click', () => {
    console.log("Mengirim 'toggleReady'...");
    socket.emit('toggleReady');
});

lobbyBtnStartGame.addEventListener('click', () => {
    console.log("Mengirim 'startGame'...");
    socket.emit('startGame');
});

// ===================================
// LISTENER PENGATURAN LOBI (DOM)
// ===================================
// (Tidak berubah, ini sudah benar)
lobbyPlayerSlots.addEventListener('click', (e) => {
    const target = e.target;
    
    if (target.classList.contains('edit-name-btn')) {
        const currentName = target.dataset.currentName;
        const newName = prompt("Masukkan nama baru (Maks 10 karakter):", currentName);
        if (newName && newName.length > 0 && newName.length <= 10) {
            socket.emit('changeName', { newName: newName });
        } else if (newName) {
            alert("Nama tidak valid (Maks 10 karakter).");
        }
    }
    
    if (target.classList.contains('kick-btn') || target.classList.contains('remove-bot-btn')) {
        const playerIdToKick = target.dataset.playerId;
        const playerName = target.dataset.playerName;
        if (confirm(`Yakin ingin mengeluarkan ${playerName}?`)) {
            socket.emit('kickPlayer', { playerIdToKick: playerIdToKick });
        }
    }
});
lobbyPlayerSlots.addEventListener('change', (e) => {
    const target = e.target;
    
    if (target.classList.contains('add-bot-select')) {
        const difficulty = target.value;
        if (difficulty) {
            console.log(`Mengirim 'addBot' dengan difficulty: ${difficulty}`);
            socket.emit('addBot', { difficulty: difficulty });
            target.value = ""; 
        }
    }
});
document.getElementById('lobby-setting-players').addEventListener('change', (e) => {
    socket.emit('changeSetting', { setting: 'maxPlayers', value: e.target.value });
});
document.getElementById('lobby-setting-hint-pair').addEventListener('change', (e) => {
    socket.emit('changeSetting', { setting: 'hintPair', value: e.target.checked });
});
document.getElementById('lobby-setting-hint-combo').addEventListener('change', (e) => {
    socket.emit('changeSetting', { setting: 'hintCombo', value: e.target.checked });
});
document.getElementById('lobby-setting-sort-timer').addEventListener('change', (e) => {
    socket.emit('changeSetting', { setting: 'sortTimer', value: e.target.value });
});
document.getElementById('lobby-setting-turn-timer').addEventListener('change', (e) => {
    socket.emit('changeSetting', { setting: 'turnTimer', value: e.target.value });
});


// ===================================
// SOCKET.IO LISTENERS (UTAMA)
// ===================================

socket.on('roomJoined', (room) => {
    console.log("Berhasil masuk room:", room);
    currentRoomState = room;
    switchScreen('room-lobby');
    renderLobby(room);
});

socket.on('roomUpdate', (room) => {
    console.log("Room ter-update:", room);
    currentRoomState = room;
    renderLobby(room);
});

socket.on('displayError', (message) => {
    alert(message);
    
    // --- PERBAIKAN BUG "STUCK" ---
    // Cek apakah game aktif dan giliran kita
    const myServerIndex = (gameState.players) ? gameState.players.findIndex(p => p.id === socket.id) : -1;
    if (isGameActive && gameState.currentPlayerIndex === myServerIndex) {
        
        // Jika server error, aktifkan lagi tombol kita
        console.log("Server menolak langkah, mengaktifkan kembali tombol.");
        btnPlayCard.disabled = false;
        btnSkipTurn.disabled = false;
        
        // Panggil validasi lagi (tombol akan jadi hijau/merah)
        validatePlayerSelection(); 
    }
    // --- AKHIR PERBAIKAN ---

    if (message.includes('di-kick')) {
        // Jika kita di-kick, reload
        currentRoomState = null;
        switchScreen('main-menu');
        window.location.reload();
    } else if (message.includes('Host telah keluar')) {
        // Jika host keluar DARI LOBI, kita reload
        // Jika host keluar DARI GAME, 'returnToLobby' akan menangani
        if (!isGameActive) {
            window.location.reload();
        }
    }
});

/**
 * Server mengirim data game LENGKAP (Logika mapping UI diperbaiki)
 */
socket.on('gameStarted', (data) => {
    const { myHand, publicState } = data;
    console.log("Server bilang GAME MULAI! Saya menerima:", data);

    // 1. Timpa state global
    gameState = publicState; 
    
    // 2. Buat array playerHands baru
    gameState.playerHands = new Array(publicState.players.length); 
    
    // 3. Cari tahu DI MANA index server kita
    const myServerIndex = publicState.players.findIndex(p => p.id === socket.id);

    // 4. SELALU taruh tangan ASLI kita di [0] (UI Index)
    gameState.playerHands[0] = myHand; 

    // 5. Isi sisa slot [1], [2], [3] dengan placeholder
    publicState.players.forEach((p, serverIndex) => {
        if (serverIndex !== myServerIndex) {
            let uiIndex = (serverIndex - myServerIndex + publicState.settings.maxPlayers) % publicState.settings.maxPlayers;
            gameState.playerHands[uiIndex] = new Array(p.cardCount).fill('placeholder');
        }
    });
    
    // 6. PANGGIL RENDER, TAPI JANGAN TAMPILKAN STATUS
    renderMultiplayerGame(myHand, false); // <-- 'false' artinya jangan update status bar
    
    // 7. TAMPILKAN MODAL
    // (Ini sekarang akan menampilkan log Adu 3 / Main Lagi di modal)
    showAdu3Modal(publicState.statusText);
});
/**
 * Server mengirim update gameState (Logika mapping UI diperbaiki)
 */
socket.on('gameStateUpdate', (publicState) => {
    console.log("Menerima gameStateUpdate:", publicState);
    
    // --- PREMOVE LOGIC (1/4): Simpan kartu yang di-select ---
    // Kita simpan ID dari kartu apa pun yang sedang dipilih
    const premoveCardIds = new Set();
    playerHandElement.querySelectorAll('.card.selected').forEach(cardEl => {
        premoveCardIds.add(cardEl.getAttribute('data-id'));
    });
    // --- AKHIR PREMOVE LOGIC (1/4) ---


    // 1. Simpan tangan ASLI kita (logika ini tetap sama)
    let myHand = (gameState.playerHands && gameState.playerHands.length > 0) ? gameState.playerHands[0] : []; 
    const myServerIndex = publicState.players.findIndex(p => p.id === socket.id);
    const iJustPlayed = (publicState.lastPlayerToPlay === myServerIndex);
    if (iJustPlayed && publicState.currentPlayPile.length > 0) {
        // console.log("Saya baru main. Membersihkan tangan (klien)..."); // (dihapus agar tidak spam log)
        const playedCardIds = new Set(publicState.currentPlayPile.map(c => c.id));
        myHand = myHand.filter(card => !playedCardIds.has(card.id));
    }
    
    // 2. Timpa state global
    gameState = publicState; 
    
    // 3. Buat ulang array playerHands (placeholder) (logika ini tetap sama)
    gameState.playerHands = new Array(publicState.players.length);
    gameState.playerHands[0] = myHand;
    publicState.players.forEach((p, serverIndex) => {
        if (serverIndex !== myServerIndex) {
            let uiIndex = (serverIndex - myServerIndex + publicState.settings.maxPlayers) % publicState.settings.maxPlayers;
            gameState.playerHands[uiIndex] = new Array(p.cardCount).fill('placeholder');
        }
    });

    // 4. Render ulang papan (logika ini tetap sama)
    renderPlayPile(); 
    
    // 4A. Render ulang tangan KITA
    playerHandElement.innerHTML = '';
    gameState.playerHands[0].forEach(card => {
        playerHandElement.innerHTML += createCardElement(card);
    });
    
    // --- PREMOVE LOGIC (2/4): Terapkan kembali selection ---
    // Setelah tangan dibuat ulang, cari kartu tadi dan pilih lagi
    if (premoveCardIds.size > 0) {
        playerHandElement.querySelectorAll('.card').forEach(cardEl => {
            if (premoveCardIds.has(cardEl.getAttribute('data-id'))) {
                cardEl.classList.add('selected');
            }
        });
    }
    // --- AKHIR PREMOVE LOGIC (2/4) ---

    // (Panggil ini SETELAH menerapkan kembali selection)
    addCardClickListeners();
    
    // --- PREMOVE LOGIC (3/4): Panggil 'disable check' ---
    // Ini adalah bagian "unselectnya otomatisnya klo kartu kita disable aja"
    // Kita panggil ini secara manual agar kartu premove yang
    // sekarang ilegal (disabled) akan di-unselect.
    updatePlayerHandInteractiveness();
    // --- AKHIR PREMOVE LOGIC (3/4) ---


    // 5. Render ulang Bot (logika ini tetap sama)
    const playerSlots = [
        { label: 'player-label', count: 'player-card-count', handEl: playerHandElement },
        { label: 'bot-1-label', count: 'bot-1-card-count', handEl: bot1HandElement },
        { label: 'bot-2-label', count: 'bot-2-card-count', handEl: bot2HandElement },
        { label: 'bot-3-label', count: 'bot-3-card-count', handEl: bot3HandElement }
    ];
    for (let i = 0; i < gameState.settings.maxPlayers; i++) {
        let uiIndex = (i - myServerIndex + gameState.settings.maxPlayers) % gameState.settings.maxPlayers;
        const slot = playerSlots[uiIndex];
        const playerData = gameState.players[i];
        document.getElementById(slot.label).textContent = playerData.name + (uiIndex === 0 ? " (Anda)" : "");
        document.getElementById(slot.count).textContent = playerData.cardCount;
        if (uiIndex !== 0) {
            slot.handEl.innerHTML = '';
            for (let j = 0; j < playerData.cardCount; j++) {
                slot.handEl.innerHTML += createCardBackHTML();
            }
        }
    }
    
    // 6. Mulai Timer Visual (logika ini tetap sama)
    let baseText = publicState.statusText;
    
    // --- PREMOVE LOGIC (4/4): Perbarui Teks Status ---
    // Jika BUKAN giliran kita, jangan tampilkan "Giliran Anda"
    // (Penting agar premove tidak bingung)
    if (publicState.currentPlayerIndex === myServerIndex) {
         if (baseText.includes(publicState.players[myServerIndex].name)) {
            baseText = "Giliran Anda";
         }
    }
    // --- AKHIR PREMOVE LOGIC (4/4) ---
    
    startVisualTimer(baseText, publicState.turnTimerDuration);
});
/**
 * Server bilang INI GILIRAN KITA!
 */
socket.on('yourTurn', () => {
    console.log("SERVER BILANG: GILIRAN SAYA!");
    
    // clearVisualTimer(); // <-- JANGAN PANGGIL INI DI SINI

    btnPlayCard.disabled = false;
    btnSkipTurn.disabled = false;
    
    const myServerIndex = (gameState.players) ? gameState.players.findIndex(p => p.id === socket.id) : -1;
    if (gameState.isFirstTurn || (gameState.lastPlayerToPlay === myServerIndex)) {
        btnSkipTurn.disabled = true;
    }
    
    // --- TAMBAHAN (PENGAMAN JIKA 'gameStateUpdate' TELAT) ---
    // Panggil timer di sini untuk memastikan.
    // 'gameStateUpdate' yang datang setelah ini akan me-restart timer-nya,
    // jadi tidak akan ada timer ganda.
    if (gameState && gameState.turnTimerDuration > 0) {
         startVisualTimer("Giliran Anda", gameState.turnTimerDuration); 
    } else {
         updateGameStatus("Giliran Anda"); // Fallback jika durasi 0
    }
    // --- AKHIR TAMBAHAN ---

    updatePlayerHandInteractiveness();
    validatePlayerSelection();
    updateHintButtons();
});

/**
 * BARU: Server bilang game selesai
 */
socket.on('gameEnded', (data) => {
    const { results, reason, revealedHands, duration } = data;
    console.log("GAME BERAKHIR! Alasan:", reason, "Durasi:", duration);
    
    isGameActive = false;
    currentRoomState = null;
    clearVisualTimer(); // Matikan timer giliran
    
    // Hentikan timer Adu 3 jika masih jalan
    if (adu3TimerInterval) closeAdu3Modal();
    // Hentikan timer countdown 'Main Lagi' sebelumnya (jika ada)
    if (postGameTimerInterval) clearInterval(postGameTimerInterval);

    btnPlayCard.disabled = true;
    btnSkipTurn.disabled = true;

    // --- LOGIKA TAMPILKAN KARTU SISA (Tetap sama) ---
    if (revealedHands) {
        const myServerIndex = gameState.players.findIndex(p => p.id === socket.id);
        const playerSlots = [ playerHandElement, bot1HandElement, bot2HandElement, bot3HandElement ];
        
        gameState.players.forEach((player, serverIndex) => {
            let uiIndex = (serverIndex - myServerIndex + gameState.settings.maxPlayers) % gameState.settings.maxPlayers;
            const handElement = playerSlots[uiIndex];
            
            if (handElement && revealedHands[player.id]) {
                if (uiIndex === 0) {
                    playerHandElement.querySelectorAll('.card').forEach(c => c.classList.remove('disabled'));
                } else {
                    renderRevealedHand(handElement, revealedHands[player.id]);
                }
            }
        });
    }
    // --- AKHIR LOGIKA KARTU SISA ---

    // Buat pesan hasil
    let resultsMessage = `--- HASIL AKHIR ---\n\n`;
    results.forEach(p => {
        resultsMessage += `Juara ${p.rank}: ${p.name}\n`;
    });

    // --- LOGIKA BARU: TAMPILKAN MODAL & TOMBOL ---
    
    // 1. HAPUS 'setTimeout' - Tampilkan modal SEKARANG
    endGameResultsElement.innerText = resultsMessage;

    // 2. Tampilkan KEDUA tombol untuk SEMUA pemain
    btnPlayAgain.classList.remove('hidden');
    btnEndGameMainMenu.classList.remove('hidden');
    
    // 3. Aktifkan tombol (jika nonaktif)
    btnPlayAgain.disabled = false;
    btnEndGameMainMenu.disabled = false;
    
    // 4. Pindah ke layar akhir
    switchScreen('end-game-screen');
    
    // 5. Mulai countdown
    if (reason !== 'disconnect' && duration > 0) {
        startPostGameVisualTimer(duration);
    } else {
        // Jika disconnect, jangan mulai countdown
        btnPlayAgain.textContent = "Main Lagi";
        btnPlayAgain.disabled = true; // Tidak bisa 'main lagi' jika ada yg disconnect
    }
});

socket.on('returnToLobby', (room) => {
    console.log("Pemain lain keluar, kembali ke lobi...");
    
    // 1. Hentikan semua timer
    clearVisualTimer();
    if (postGameTimerInterval) {
        clearInterval(postGameTimerInterval);
        postGameTimerInterval = null;
    }
    if (adu3TimerInterval) closeAdu3Modal();

    // 2. Simpan state lobi baru
    currentRoomState = room;
    isGameActive = false;
    
    // 3. Render ulang lobi (ini akan menunjukkan host baru jika host lama keluar)
    renderLobby(room);
    
    // 4. Pindah layar
    switchScreen('room-lobby');
    
    // 5. Tampilkan notifikasi
    alert("Seorang pemain telah keluar. Kembali ke lobi.");
});

// ===================================
// FUNGSI RENDER LOBI (UI)
// ===================================
// (Tidak berubah, ini sudah benar)
function renderLobby(room) {
    lobbyRoomId.textContent = room.id;

    const myData = room.players.find(p => p.id === socket.id);
    if (!myData) return; 
    
    const isHost = myData.isHost;

    if (isHost) {
        lobbyBtnReady.classList.add('hidden');
        lobbyBtnStartGame.classList.remove('hidden');
        
        const totalPlayers = room.players.length;
        const totalReady = room.players.filter(p => p.isReady).length;
        
        if (totalPlayers < room.settings.maxPlayers) {
            lobbyBtnStartGame.disabled = true;
            lobbyBtnStartGame.textContent = `Menunggu Pemain... (${totalPlayers}/${room.settings.maxPlayers})`;
        } else if (totalReady < totalPlayers) {
            lobbyBtnStartGame.disabled = true;
            lobbyBtnStartGame.textContent = `Menunggu Siap... (${totalReady}/${totalPlayers})`;
        } else {
            lobbyBtnStartGame.disabled = false;
            lobbyBtnStartGame.textContent = "MULAI PERMAINAN";
        }

    } else {
        lobbyBtnReady.classList.remove('hidden');
        lobbyBtnStartGame.classList.add('hidden');

        if (myData.isReady) {
            lobbyBtnReady.textContent = "BATAL SIAP";
            lobbyBtnReady.classList.add('ready');
        } else {
            lobbyBtnReady.textContent = "SIAP";
            lobbyBtnReady.classList.remove('ready');
        }
    }
    
    const settingsPanel = document.getElementById('lobby-right');
    const inputs = settingsPanel.querySelectorAll('select, input');
    
    if (isHost) {
        settingsPanel.classList.remove('disabled-for-client');
        inputs.forEach(input => input.disabled = false);
    } else {
        settingsPanel.classList.add('disabled-for-client');
        inputs.forEach(input => input.disabled = true);
    }
    
    document.getElementById('lobby-setting-players').value = room.settings.maxPlayers;
    document.getElementById('lobby-setting-hint-pair').checked = room.settings.hintPair;
    document.getElementById('lobby-setting-hint-combo').checked = room.settings.hintCombo;
    document.getElementById('lobby-setting-sort-timer').value = room.settings.sortTimer;
    document.getElementById('lobby-setting-turn-timer').value = room.settings.turnTimer;

    lobbyPlayerSlots.innerHTML = '';
    
    for (let i = 0; i < room.settings.maxPlayers; i++) {
        const player = room.players[i];
        
        if (player) {
            const slotEl = document.createElement('div');
            slotEl.className = 'player-slot';
            if (player.isBot) slotEl.classList.add('bot');
            
            const nameEl = document.createElement('span');
            nameEl.className = 'player-name';
            nameEl.textContent = player.name;
            if (player.id === socket.id) nameEl.textContent += " (Anda)";
            
            if (player.id === socket.id && !player.isBot) {
                const editBtn = document.createElement('button');
                editBtn.className = 'action-btn edit-name-btn';
                editBtn.textContent = '✏️';
                editBtn.dataset.currentName = player.name;
                nameEl.appendChild(editBtn);
            }
            slotEl.appendChild(nameEl);

            if (isHost && player.id !== socket.id) {
                if (player.isBot) {
                    const removeBotBtn = document.createElement('button');
                    removeBotBtn.className = 'action-btn remove-bot-btn';
                    removeBotBtn.textContent = 'Hapus Bot';
                    removeBotBtn.dataset.playerId = player.id;
                    removeBotBtn.dataset.playerName = player.name;
                    slotEl.appendChild(removeBotBtn);
                } else {
                    const kickBtn = document.createElement('button');
                    kickBtn.className = 'action-btn kick-btn';
                    kickBtn.textContent = 'Kick';
                    kickBtn.dataset.playerId = player.id;
                    kickBtn.dataset.playerName = player.name;
                    slotEl.appendChild(kickBtn);
                }
            }
            
            const statusEl = document.createElement('span');
            statusEl.className = 'player-status';
            if (player.isReady) {
                statusEl.textContent = 'Siap';
                statusEl.classList.add('ready');
            } else {
                statusEl.textContent = 'Menunggu...';
                statusEl.classList.add('not-ready');
            }
            slotEl.appendChild(statusEl);
            lobbyPlayerSlots.appendChild(slotEl);

        } else {
            const slotEl = document.createElement('div');
            slotEl.className = 'player-slot empty';
            const nameEl = document.createElement('span');
            nameEl.className = 'player-name';
            nameEl.textContent = '(Slot Kosong)';
            slotEl.appendChild(nameEl);

            if (isHost) {
                const addBotSelect = document.createElement('select');
                addBotSelect.className = 'action-btn add-bot-select';
                addBotSelect.dataset.slotIndex = i;
                addBotSelect.innerHTML = `
                    <option value="">+ Tambah Bot</option>
                    <option value="easy">Bot Easy</option>
                    <option value="normal">Bot Normal</option>
                    <option value="hard">Bot Hard</option>
                `;
                slotEl.appendChild(addBotSelect);
            }
            lobbyPlayerSlots.appendChild(slotEl);
        }
    }
}

// ===================================
// EVENT LISTENERS GAMEPLAY (REFAKTOR)
// ===================================

btnSortCards.addEventListener('click', () => {
    isSortMode = !isSortMode; 
    
    if (isSortMode) {
        sortableInstance.option('disabled', false); 
        btnSortCards.textContent = "Selesai Susun";
        btnSortCards.style.backgroundColor = "#4CAF50"; 
        
        btnPlayCard.classList.add('hidden');
        btnSkipTurn.classList.add('hidden');
        btnHintPair.classList.add('hidden');
        btnHintCombo.classList.add('hidden');
        
        btnResetSort.classList.remove('hidden');
        btnUnselect.classList.remove('hidden');
        
        // Tampilkan "Kombo Chance" jika Easy (sesuai setting server)
        if (gameState.settings.hintCombo) { // (Kita pakai hintCombo sbg ganti difficulty)
            updateKomboChanceButton();
            btnKomboChance.classList.remove('hidden');
        }
        
        playerHandElement.classList.add('sorting-mode');
        playerHandElement.querySelectorAll('.card').forEach(c => c.classList.remove('disabled'));
        
        playerHandElement.querySelectorAll('.card.selected').forEach(c => c.classList.remove('selected'));
        updateUnselectButtonState();

    } else {
        sortableInstance.option('disabled', true); 
        btnSortCards.textContent = "Susun Kartu";
        btnSortCards.style.backgroundColor = "";
        
        btnPlayCard.classList.remove('hidden');
        btnSkipTurn.classList.remove('hidden');
        
        if (gameState.settings.hintPair) {
            btnHintPair.classList.remove('hidden');
        }
        if (gameState.settings.hintCombo) {
            btnHintCombo.classList.remove('hidden'); 
        }
        
        btnResetSort.classList.add('hidden');
        btnKomboChance.classList.add('hidden');
        btnUnselect.classList.add('hidden');
        
        playerHandElement.classList.remove('sorting-mode');
        updateHandOrderFromDOM(); // Simpan urutan

        updatePlayerHandInteractiveness(); 
        validatePlayerSelection();
    }
});

/**
 * REFAKTOR: Tombol "Jalan" HANYA mengirim emit
 */
btnPlayCard.addEventListener('click', () => {
    
    const selectedElements = playerHandElement.querySelectorAll('.card.selected');
    if (selectedElements.length === 0) {
        alert("Pilih kartu!"); // Validasi UI cepat
        return;
    }

    // Ambil semua ID kartu
    const selectedCardIds = [];
    selectedElements.forEach(el => {
        selectedCardIds.push(el.getAttribute('data-id'));
    });
    
    // (Validasi 'sisa 2' dan 'kombo' sudah diurus oleh validatePlayerSelection()
    // yang membuat tombol ini hijau/merah. Server akan memvalidasi ulang)

    console.log(`Mengirim 'playTurn' dengan ${selectedCardIds.length} kartu`);
    btnPlayCard.disabled = true; // Matikan tombol selagi menunggu server
    btnSkipTurn.disabled = true;
    
    socket.emit('playTurn', { cards: selectedCardIds });
});

/**
 * REFAKTOR: Tombol "Skip" HANYA mengirim emit
 */
btnSkipTurn.addEventListener('click', () => {
    // (Validasi 'wajib main' akan ditangani oleh server)
    console.log("Mengirim 'skipTurn'...");
    btnPlayCard.disabled = true; // Matikan tombol selagi menunggu server
    btnSkipTurn.disabled = true;

    socket.emit('skipTurn');
});

// Tombol "Reset Sort"
btnResetSort.addEventListener('click', () => {
    console.log("Menyusun kartu otomatis (by value)...");
    
    sortPlayerHand(); // Panggil fungsi sortir lokal
    // (renderHands() tidak ada, jadi panggil ini)

    if (sortableInstance) {
        sortableInstance.destroy();
    }
    
    sortableInstance = new Sortable(playerHandElement, {
        animation: 150,
        disabled: false, // Tetap aktif
        onEnd: (evt) => {
            updateHandOrderFromDOM();
        }
    });
    playerHandElement.classList.add('sorting-mode');
});

// Tombol "Main Lagi" -> HANYA UNTUK HOST (Logika di server)
btnPlayAgain.addEventListener('click', () => {
    // Tombol ini tidak lagi mengirim 'playAgain'
    // Server menangani 'Main Lagi' secara otomatis
    
    // Beri feedback visual bahwa kita menunggu
    btnPlayAgain.disabled = true;
    btnPlayAgain.textContent = "Menunggu...";
    
    // Hentikan timer countdown visual (jika ada)
    if (postGameTimerInterval) {
        clearInterval(postGameTimerInterval);
        postGameTimerInterval = null;
    }
});

btnEndGameMainMenu.addEventListener('click', () => {
    socket.emit('requestMainMenu');
    // Reload halaman
    window.location.reload();
});

// ===================================
// FUNGSI HINT ENGINE (UI)
// ===================================
// (Tidak berubah, ini sudah benar)

function getCardRankCounts(hand) {
    const counts = {};
    for (const card of hand) {
        counts[card.rank] = (counts[card.rank] || 0) + 1;
    }
    return counts;
}

// game.js

const COMBO_5_CARD_RANKS = {
    'straight': 1,
    'flush': 2,
    'full-house': 3,
    'straight-flush': 4 // Ini juga Bomb
};

/**
 * DIPERBARUI (v6): Perbaikan Logika '2 vs 2'
 */
function isComboValid(newCombo, pileCombo) {
    // 1. Meja Kosong
    if (!pileCombo || pileCombo.type === 'invalid') {
        return true;
    }

    // 2. Definisikan Status
    const isNewBomb = newCombo.isBomb === true;
    const isPileBomb = pileCombo.isBomb === true;
    const isPileSingleTwo = (pileCombo.type === 'one-card' && pileCombo.cards[0].rank === '2');

    // 3. Logika Bomb (Kartu Baru adalah Bomb)
    if (isNewBomb) {
        if (isPileSingleTwo) {
            return true; // Bomb vs 2
        }
        if (isPileBomb) {
            // Bomb vs Bomb
            const newRank_5card = COMBO_5_CARD_RANKS[newCombo.type]; // (4=SF, undefined=4ofK)
            const pileRank_5card = COMBO_5_CARD_RANKS[pileCombo.type];
            
            if (newRank_5card && !pileRank_5card) return true; // SF (baru) vs 4ofK (lama)
            if (!newRank_5card && pileRank_5card) return false; // 4ofK (baru) vs SF (lama)
            
            // Keduanya SF atau Keduanya 4ofK
            return newCombo.value > pileCombo.value; 
        }
        return true; // Bomb vs Non-Bomb (Misal: 4ofK vs Full House)
    }
    
    // 4. Logika Non-Bomb (Kartu Baru BUKAN Bomb)
    if (!isNewBomb) {
        if (isPileBomb) {
            return false; // Non-Bomb vs Bomb
        }
        
        // --- INI PERBAIKAN UNTUK BUG 1 ---
        if (isPileSingleTwo) {
            // Meja adalah '2' tunggal.
            // Kartu baru (non-bomb) HARUS '2' tunggal juga.
            if (newCombo.type === 'one-card' && newCombo.cards[0].rank === '2') {
                // Keduanya 2 tunggal, cek nilai
                return newCombo.value > pileCombo.value; // (Misal: 2 Sekop vs 2 Keriting)
            }
            // Jika kartu baru BUKAN 2 tunggal (misal King, atau Pair 3)
            return false; 
        }
        // --- AKHIR PERBAIKAN ---

        // 5. Logika Normal vs Normal (Bukan Bomb, Bukan '2' tunggal)
        const newRank_5card = COMBO_5_CARD_RANKS[newCombo.type];
        const pileRank_5card = COMBO_5_CARD_RANKS[pileCombo.type];

        // Kasus A: 5-Kartu vs 5-Kartu
        if (newRank_5card && pileRank_5card) {
            if (newRank_5card > pileRank_5card) return true;
            if (newRank_5card === pileRank_5card && newCombo.value > pileCombo.value) return true;
            return false; // Kalah hierarki 5 kartu
        }

        // Kasus B: Tipe Sama (Pair vs Pair, Tris vs Tris, dll)
        if (newCombo.type === pileCombo.type && newCombo.value > pileCombo.value) {
            return true;
        }
    }
    
    // Semua kasus lain gagal
    return false;
}

function getOpeningPairHintPriority(combo, rankCounts) {
    const value = combo.value;
    const rank = combo.cards[0].rank;
    if (combo.type === '1-pair' && value <= RANK_VALUES['10'] * 4 + 3) return 100 + value;
    if (combo.type === 'one-card' && rankCounts[rank] === 1 && value <= RANK_VALUES['K'] * 4 + 3) return 200 + value;
    if (combo.type === '1-pair' && value <= RANK_VALUES['K'] * 4 + 3) return 300 + value;
    if (combo.type === 'one-card' && rankCounts[rank] === 1) return 400 + value;
    if (combo.type === '1-pair') return 500 + value;
    if (combo.type === 'one-card') return 600 + value;
    return 999;
}
function getOpeningComboHintPriority(combo) {
    const value = combo.value;
    switch (combo.type) {
        case 'straight': return 100 + value;
        case 'flush': return 200 + value;
        case 'full-house': return 300 + value;
        case 'seri-buntut': return 400 + value;
        case 'bro-sis': return 500 + value;
        case 'tris': return 600 + value;
        case 'seri': return 700 + value;
        case 'straight-flush': return 800 + value;
        case '4-of-a-kind': return 900 + value;
        default: return 999;
    }
}
function getCounterPairHintPriority(combo, rankCounts, pileCombo) {
    const value = combo.value;
    const rank = combo.cards[0].rank;
    if (pileCombo.type === 'one-card') {
        if (rankCounts[rank] === 1) return 100 + value;
        return 200 + value;
    }
    if (pileCombo.type === '1-pair') {
        if (rankCounts[rank] === 2) return 100 + value;
        if (rankCounts[rank] === 3) return 200 + value;
        if (rankCounts[rank] === 4) return 300 + value;
    }
    return 999;
}
function getCounterComboHintPriority(combo, pileCombo) {
    const value = combo.value;
    if (combo.type === pileCombo.type) {
        return 100 + value;
    }
    if (COMBO_5_CARD_RANKS[combo.type]) {
        return (COMBO_5_CARD_RANKS[combo.type] * 1000) + value;
    }
    return 9000 + value;
}

function updateHintButtons() {
    updatePlayerHandInteractiveness();
    
    hintPairState = { index: 0, hints: [] };
    hintComboState = { index: 0, hints: [] };
    btnHintPair.disabled = true;
    btnHintCombo.disabled = true;
    hintComboCountElement.textContent = "(0)";
    
    // Cek apakah giliran kita
    const myServerIndex = gameState.players.findIndex(p => p.id === socket.id);
    if (gameState.currentPlayerIndex !== myServerIndex) {
        return;
    }
    
    const hand = gameState.playerHands[0];
    const pileCombo = gameState.currentPlayPile.length > 0 ? getComboDetails(gameState.currentPlayPile) : null;
    const rankCounts = getCardRankCounts(hand);
    
    const allPlayerCombos = findAllOpeningCombos(hand);
    const allValidPlays = allPlayerCombos.filter(combo => isComboValid(combo, pileCombo));
    
    let allPairHints = allValidPlays.filter(c => c.cards.length <= 2);
    let allComboHints = allValidPlays.filter(c => c.cards.length >= 3);

    if (pileCombo) {
        allPairHints.sort((a, b) => getCounterPairHintPriority(a, rankCounts, pileCombo) - getCounterPairHintPriority(b, rankCounts, pileCombo));
        allComboHints.sort((a, b) => getCounterComboHintPriority(a, pileCombo) - getCounterComboHintPriority(b, pileCombo));
    } else {
        allPairHints.sort((a, b) => getOpeningPairHintPriority(a, rankCounts) - getOpeningPairHintPriority(b, rankCounts));
        allComboHints.sort((a, b) => getOpeningComboHintPriority(a) - getOpeningComboHintPriority(b));
    }
    
    hintPairState.hints = allPairHints;
    hintComboState.hints = allComboHints;
    
    // Aktifkan berdasarkan setting server
    if (hintPairState.hints.length > 0 && gameState.settings.hintPair) {
        btnHintPair.disabled = false;
    }
    if (hintComboState.hints.length > 0 && gameState.settings.hintCombo) {
        btnHintCombo.disabled = false;
        hintComboCountElement.textContent = `(${hintComboState.hints.length})`;
    }
}

function updateUnselectButtonState() {
    if (!isSortMode) return;
    const selectedElements = playerHandElement.querySelectorAll('.card.selected');
    btnUnselect.disabled = (selectedElements.length === 0);
}
function updateKomboChanceButton() {
    komboChanceState = { index: 0, hints: [] };
    const allPlayerCombos = findAllOpeningCombos(gameState.playerHands[0]);
    const allComboHints = allPlayerCombos.filter(c => c.cards.length >= 3);
    allComboHints.sort((a, b) => getOpeningComboHintPriority(a) - getOpeningComboHintPriority(b));
    komboChanceState.hints = allComboHints;
    
    if (komboChanceState.hints.length > 0) {
        btnKomboChance.disabled = false;
        komboChanceCountElement.textContent = `(${komboChanceState.hints.length})`;
    } else {
        btnKomboChance.disabled = true;
        komboChanceCountElement.textContent = "(0)";
    }
}
function selectHintCards(cards) {
    playerHandElement.querySelectorAll('.card.selected').forEach(c => c.classList.remove('selected'));
    
    if (cards && cards.length > 0) {
        cards.forEach(cardData => {
            const cardEl = playerHandElement.querySelector(`[data-id="${cardData.id}"]`);
            if (cardEl) {
                cardEl.classList.add('selected');
            }
        });
    }
    validatePlayerSelection();
    updateUnselectButtonState();
}

btnHintPair.addEventListener('click', () => {
    if (hintPairState.hints.length === 0) return;
    const selectedElements = playerHandElement.querySelectorAll('.card.selected');
    if (selectedElements.length === 0) {
        hintPairState.index = 0;
    }
    const hint = hintPairState.hints[hintPairState.index];
    selectHintCards(hint.cards);
    hintPairState.index = (hintPairState.index + 1) % hintPairState.hints.length;
});
btnHintCombo.addEventListener('click', () => {
    if (hintComboState.hints.length === 0) return;
    const selectedElements = playerHandElement.querySelectorAll('.card.selected');
    if (selectedElements.length === 0) {
        hintComboState.index = 0;
    }
    const hint = hintComboState.hints[hintComboState.index];
    selectHintCards(hint.cards);
    hintComboState.index = (hintComboState.index + 1) % hintComboState.hints.length;
});
btnKomboChance.addEventListener('click', () => {
    if (komboChanceState.hints.length === 0) return;
    const hint = komboChanceState.hints[komboChanceState.index];
    selectHintCards(hint.cards);
    komboChanceState.index = (komboChanceState.index + 1) % komboChanceState.hints.length;
    updateUnselectButtonState(); 
});
btnUnselect.addEventListener('click', () => {
    playerHandElement.querySelectorAll('.card.selected').forEach(c => c.classList.remove('selected'));
    updateUnselectButtonState();
});

// ===================================
// FUNGSI VALIDASI UI (CLIENT-SIDE)
// ===================================
// (Tidak berubah, ini sudah benar)

function updatePlayerHandInteractiveness() {
    // 1. Reset semua kartu
    playerHandElement.querySelectorAll('.card').forEach(c => c.classList.remove('disabled'));

    // 2. Jangan disable apa-apa jika mode susun
    if (isSortMode) return;

    // 3. Cek Meja Kosong
    if (gameState.currentPlayPile.length === 0) {
        return;
    }
    const pileCombo = getComboDetails(gameState.currentPlayPile);
    if (pileCombo.type === 'invalid') return;

    // 4. Cek 5-Kartu
    if (pileCombo.cards.length === 5) {
        return; // Terlalu rumit, biarkan semua aktif
    }

    // 5. Cek '2' Tunggal (Logika ini sudah OK)
    const isPileSingleTwo = (pileCombo.type === 'one-card' && pileCombo.cards[0].rank === '2');
    if (isPileSingleTwo) {
        let cardIdsToKeepActive = new Set();
        const allPlayerCombos = findAllOpeningCombos(gameState.playerHands[0]);
        const allBombs = allPlayerCombos.filter(c => c.type === 'straight-flush' || c.type === '4-of-a-kind');
        
        allBombs.forEach(bomb => {
            bomb.cards.forEach(card => cardIdsToKeepActive.add(card.id));
        });
        
        playerHandElement.querySelectorAll('.card').forEach(cardEl => {
            if (!cardIdsToKeepActive.has(cardEl.getAttribute('data-id'))) {
                cardEl.classList.add('disabled');
                cardEl.classList.remove('selected');
            }
        });
        return; // Selesai
    }

    // 6. LOGIKA BARU (vs Normal Play: 1, 2, 3, 4 kartu)
    
    const pileType = pileCombo.type;
    const pileValue = pileCombo.value; // Ini adalah value kartu TERTINGGI di kombo
    let cardIdsToKeepActive = new Set(); // Kartu yang JANGAN di-disable

    // --- PERBAIKAN BUG UTAMA ADA DI SINI ---
    // SELALU tambahkan semua kartu yang nilainya > pileValue
    // Ini akan otomatis meng-handle:
    // - Pair 8 vs Pair 7
    // - Tris 9 vs Tris 8
    // - Single K vs Single J
    gameState.playerHands[0].forEach(card => {
        if (card.value > pileValue) {
            cardIdsToKeepActive.add(card.id);
        }
    });
    // --- AKHIR PERBAIKAN BUG UTAMA ---
    
    // --- LOGIKA TAMBAHAN (dari V7) untuk MENANG DENGAN RANK SAMA ---
    // (Contoh: [7C, 7S] vs [7D, 7H])
    if (pileType === '1-pair' || pileType === 'tris' || pileType === '4-of-a-kind') {
        const pileRank = pileCombo.cards[0].rank; // Misal: '7'

        // 1. Ambil semua kartu kita yang rank-nya sama
        const ourMatchingCards = gameState.playerHands[0]
            .filter(card => card.rank === pileRank)
            .sort((a, b) => b.value - a.value); // Sortir tinggi ke rendah

        let canWinWithSameRank = false;

        // Cek apakah kita bisa membentuk kombo tandingan
        if (pileType === '1-pair' && ourMatchingCards.length >= 2) {
            // Cek pair tertinggi kita
            const ourBestPairValue = ourMatchingCards[0].value;
            if (ourBestPairValue > pileValue) {
                canWinWithSameRank = true;
            }
        }
        // (Bisa ditambahkan logika untuk Tris vs Tris, dll. jika perlu)

        // 2. Tandai kartu yang boleh aktif
        if (canWinWithSameRank) {
            // Jika kita bisa menang, tambahkan SEMUA kartu rank tsb ke set
            ourMatchingCards.forEach(card => cardIdsToKeepActive.add(card.id));
        }
    }
    
    // (Logika 5-card / Bomb vs Pair/Tris belum ditangani, 
    //  tapi ini akan memperbaiki bug "disable semua")

    // 7. Loop Terakhir: Nonaktifkan semua yang TIDAK ada di set
    playerHandElement.querySelectorAll('.card').forEach(cardEl => {
        const cardId = cardEl.getAttribute('data-id');
        if (!cardIdsToKeepActive.has(cardId)) {
            cardEl.classList.add('disabled');
            cardEl.classList.remove('selected');
        }
    });
}

function setButtonState(state) {
    btnPlayCard.classList.remove('btn-enabled-green', 'btn-disabled-red');
    if (btnPlayCard.disabled) {
        return;
    }
    if (state === 'green') {
        btnPlayCard.classList.add('btn-enabled-green');
    } else if (state === 'red') {
        btnPlayCard.classList.add('btn-disabled-red');
    }
}

function validatePlayerSelection() {
    const selectedElements = playerHandElement.querySelectorAll('.card.selected');
    if (selectedElements.length === 0) {
        setButtonState('red');
        return;
    }

    const selectedCards = [];
    selectedElements.forEach(el => {
        const cardId = el.getAttribute('data-id');
        const card = gameState.playerHands[0].find(c => c.id === cardId);
        selectedCards.push(card);
    });

    const newCombo = getComboDetails(selectedCards);
    if (newCombo.type === 'invalid') {
        setButtonState('red');
        return;
    }

    // Validasi 'Sisa 2'
    const remainingCardsCount = gameState.playerHands[0].length - selectedCards.length;
    if (remainingCardsCount === 0) {
        const isAllTwos = selectedCards.every(card => card.rank === '2');
        if (isAllTwos && newCombo.cards.length < 5) {
            setButtonState('red');
            return;
        }
    }
    if (remainingCardsCount === 1) {
        const remainingCard = gameState.playerHands[0].find(handCard => {
            return !selectedCards.some(selectedCard => selectedCard.id === handCard.id);
        });
        if (remainingCard && remainingCard.rank === '2') {
            setButtonState('red');
            return;
        }
    }

    // Validasi Lawan
    const pileCombo = gameState.currentPlayPile.length > 0 ? getComboDetails(gameState.currentPlayPile) : null;
    
    if (isComboValid(newCombo, pileCombo)) {
        setButtonState('green');
    } else {
        setButtonState('red');
    }
}

function closeAdu3Modal() {
    if (adu3TimerInterval) {
        clearInterval(adu3TimerInterval);
        adu3TimerInterval = null;
    }
    adu3Modal.classList.add('hidden');
    adu3Modal.classList.remove('active');
}

/**
 * Menampilkan modal Adu 3 dengan countdown
 * @param {string} text Konten untuk ditampilkan (dari statusText)
 */
function showAdu3Modal(text) {
    // 1. Set teks
    adu3ModalText.textContent = text;
    
    // 2. Tampilkan modal
    adu3Modal.classList.remove('hidden');
    adu3Modal.classList.add('active');

    // 3. Siapkan countdown
    let countdown = 3;
    adu3BtnOk.textContent = `Oke (${countdown}s)`;

    // 4. Hapus timer lama jika ada (safety check)
    if (adu3TimerInterval) {
        clearInterval(adu3TimerInterval);
    }

    // 5. Mulai timer baru
    adu3TimerInterval = setInterval(() => {
        countdown--;
        adu3BtnOk.textContent = `Oke (${countdown}s)`;

        if (countdown <= 0) {
            closeAdu3Modal();
        }
    }, 1000); // Hitung setiap 1 detik
}

// ===================================
// MULAI APLIKASI
// ===================================
// (Hapus loadAndResumeGame(), ganti dengan pindah ke main-menu)
switchScreen('main-menu');

