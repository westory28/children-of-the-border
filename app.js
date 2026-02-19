// Game State
const state = {
    phase: 0, // 0: Intro, 1: Selection, 2: Main Loop, 3: Ending
    turn: 1,
    maxTurns: 10,
    hp: 100,
    items: [],
    character: null, // 'mediator', 'realist', etc.
    history: [], // For summary
    currentScenario: null,
    isWaiting: false // Prevent double input
};

// DOM Elements
const elements = {
    chatHistory: document.getElementById('chat-history'),
    userInput: document.getElementById('user-input'),
    sendBtn: document.getElementById('send-btn'),
    choicesContainer: document.getElementById('choices-container'),
    statusPanel: document.getElementById('status-panel'),
    hpBar: document.getElementById('hp-bar-fill'),
    hpText: document.getElementById('hp-text'),
    turnText: document.getElementById('turn-text'),
    charClass: document.getElementById('char-class'),
    inventory: document.getElementById('inventory'),
    overlay: document.getElementById('overlay'),
    diceResult: document.getElementById('dice-result'),
    sceneImage: document.getElementById('scene-image'),
    sceneDisplay: document.getElementById('scene-display')
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    elements.sendBtn.addEventListener('click', handleInput);
    elements.userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleInput();
    });
});

function handleInput() {
    if (state.isWaiting) return;

    const text = elements.userInput.value.trim();
    if (!text) return;

    // Display user message
    appendMessage('user', text);
    elements.userInput.value = '';

    // Process Input based on Phase
    processGameLogic(text);
}

function processGameLogic(input) {
    if (state.phase === 0) {
        if (input.includes('게임 시작') || input.includes('시작')) {
            state.phase = 1;
            appendMessage('system', "캐릭터를 선택해주세요.");
            showCharacterSelection();
        } else {
            setTimeout(() => {
                appendMessage('system', "준비가 되셨다면 '게임 시작'을 입력해주세요.");
            }, 500);
        }
    }
}

function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.innerHTML = text.replace(/\n/g, '<br>'); // Support basic line breaks
    elements.chatHistory.appendChild(msgDiv);

    // Auto scroll
    elements.sceneDisplay.scrollTop = elements.sceneDisplay.scrollHeight;
}

function showCharacterSelection() {
    const choices = Object.keys(CHARACTERS).map(key => ({
        id: key,
        text: `<strong>${CHARACTERS[key].name}</strong><br>${CHARACTERS[key].description}<br>🔹 능력: ${CHARACTERS[key].ability}`
    }));

    renderChoices(choices, (choiceId) => {
        selectCharacter(choiceId);
    });
}

function selectCharacter(charKey) {
    state.character = CHARACTERS[charKey];
    state.hp = state.character.stats.hp;
    state.items = [...state.character.items];

    // Update UI
    elements.statusPanel.classList.remove('hidden');
    updateStatus();

    appendMessage('system', `<strong>${state.character.name}</strong>(으)로 시작합니다.`);

    // Start Main Loop
    state.phase = 2;
    startTurn();
}

function startTurn() {
    if (state.turn > state.maxTurns || state.hp <= 0) {
        endGame();
        return;
    }

    // Load Scenario
    // Simple logic: Load scenario by ID matching turn number (cycling if needed)
    const scenarioIdx = (state.turn - 1) % SCENARIOS.length;
    state.currentScenario = SCENARIOS[scenarioIdx];

    // Show Scenario Image
    const imagePath = `assets/${state.currentScenario.imageType}.png`;
    elements.sceneImage.src = imagePath;
    elements.sceneImage.classList.add('visible');

    // Hide image if failed to load (graceful degradation)
    elements.sceneImage.onerror = () => {
        elements.sceneImage.classList.remove('visible');
    };

    setTimeout(() => {
        appendMessage('gm', `<strong>[Turn ${state.turn}] ${state.currentScenario.title}</strong><br>${state.currentScenario.description}`);

        // Show Options
        const choices = state.currentScenario.choices.map((c, idx) => ({
            id: idx,
            text: c.text,
            data: c
        }));

        renderChoices(choices, (choiceId) => {
            resolveAction(state.currentScenario.choices[choiceId]);
        });
    }, 600);
}

function renderChoices(options, callback) {
    elements.choicesContainer.innerHTML = '';
    elements.choicesContainer.classList.remove('hidden');
    elements.userInput.disabled = true;

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = opt.text;
        btn.onclick = () => {
            elements.choicesContainer.classList.add('hidden');
            elements.userInput.disabled = false;
            callback(opt.id);
        };
        elements.choicesContainer.appendChild(btn);
    });
    // Scroll to bottom to show choices
    setTimeout(() => elements.sceneDisplay.scrollTop = elements.sceneDisplay.scrollHeight, 100);
}

function resolveAction(choice) {
    appendMessage('user', choice.text);

    state.isWaiting = true;

    // Check if Dice Roll needed (difficulty > 0)
    if (choice.difficulty > 0) {
        appendMessage('system', "주사위를 굴립니다... (2d6)");

        setTimeout(() => {
            rollDice((total, isSuccess) => {
                let resultText = "";
                let hpChange = 0;

                if (total >= 10 || (total >= choice.difficulty && choice.difficulty > 0)) {
                    // Success
                    resultText = `<span style="color:blue">성공! (주사위: ${total})</span><br>${choice.reward}`;
                    if (choice.reward.includes("회복")) hpChange = 10; // Simple logic
                } else if (total >= 7) {
                    // Partial
                    resultText = `<span style="color:orange">부분 성공 (주사위: ${total})</span><br>성공했지만 대가 지불.`;
                    hpChange = -5;
                } else {
                    // Fail
                    resultText = `<span style="color:red">실패 (주사위: ${total})</span><br>${choice.penalty}`;
                    // Extract damage number if present in text, else default
                    if (choice.penalty.includes("-")) {
                        const match = choice.penalty.match(/-(\d+)/);
                        if (match) hpChange = -parseInt(match[1]);
                    } else {
                        hpChange = -10;
                    }
                }

                applyResult(resultText, hpChange);
            });
        }, 1000);
    } else {
        // Safe choice
        setTimeout(() => {
            applyResult(choice.reward, 0);
        }, 500);
    }
}

function rollDice(callback) {
    elements.overlay.classList.remove('hidden');
    const cube1 = document.getElementById('cube1');
    const cube2 = document.getElementById('cube2');
    const totalDisplay = document.getElementById('dice-total');

    // Reset classes
    cube1.className = 'cube';
    cube2.className = 'cube';
    totalDisplay.innerText = '';

    // Trigger Reflow to allow restart animation
    void cube1.offsetWidth;

    // Start rolling animation (optional, via CSS class if needed, or just transition)
    // Here we just set a random rotation first for effect, then final

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;

    // Apply final rotation classes
    // We use a slight timeout to ensure the transition happens
    setTimeout(() => {
        cube1.classList.add(`show-${die1}`);
        cube2.classList.add(`show-${die2}`);
    }, 100);

    // Show total after animation ends (1s in CSS)
    setTimeout(() => {
        totalDisplay.innerText = `Total: ${total}`;

        setTimeout(() => {
            elements.overlay.classList.add('hidden');
            callback(total);
        }, 1500);
    }, 1100);
}

function applyResult(text, hpChange) {
    state.hp += hpChange;
    if (state.hp > 100) state.hp = 100;
    if (state.hp < 0) state.hp = 0;

    // Log history
    state.history.push({
        turn: state.turn,
        event: state.currentScenario.title,
        result: text,
        hpChange: hpChange
    });

    updateStatus();
    appendMessage('system', text);

    state.isWaiting = false;

    // Next Turn
    state.turn++;
    setTimeout(startTurn, 1500);
}

function updateStatus() {
    elements.hpText.innerText = `${state.hp}/100`;
    elements.hpBar.style.width = `${state.hp}%`;
    elements.turnText.innerText = `${state.turn}/${state.maxTurns}`;
    elements.charClass.innerText = state.character ? state.character.name.split(' ')[0] : '-';
    elements.inventory.innerText = state.items.length > 0 ? state.items[0] + (state.items.length > 1 ? ` 외 ${state.items.length - 1}` : '') : '없음';
}

function endGame() {
    let endingMsg = "";
    if (state.hp <= 0) {
        endingMsg = "<h2>GAME OVER</h2><p>당신은 혼란스러운 통일의 과도기를 견뎌내지 못했습니다. 건강이 악화되어 쓰러지고 말았습니다.</p>";
    } else {
        endingMsg = "<h2>THE END</h2><p>10일간의 여정이 끝났습니다. 당신은 급변하는 사회 속에서 자신만의 자리를 찾아냈습니다.</p>";
    }

    // Summary
    let summaryHtml = "<br><strong>[모험 요약]</strong><br>";
    state.history.forEach(h => {
        summaryHtml += `- 턴 ${h.turn}: ${h.event} (${h.hpChange >= 0 ? '+' : ''}${h.hpChange})<br>`;
    });

    // Clear choices
    elements.choicesContainer.innerHTML = `<button class="choice-btn" onclick="location.reload()">다시 시작하기</button>`;
    elements.choicesContainer.classList.remove('hidden');

    appendMessage('system', endingMsg + summaryHtml);
}
