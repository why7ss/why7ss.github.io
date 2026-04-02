// ============================================
// MINECRAFT STAFF TEST - MAIN APPLICATION
// ============================================

// Configuration - ДВА ВЕБХУКА
const CONFIG = {
    // Основной канал - итоговые результаты
    webhookResults: 'https://discord.com/api/webhooks/1489390914672529459/st-SOKXZ85hQaTQ7reICAMQgB-uR08kXgFaL6d7z6CAVLMZIYZ271IHfbnctXga_NWO7',
    
    // Лог-канал - выходы, рестарты, подозрительная активность  
    webhookLogs: 'https://discord.com/api/webhooks/1489401306345902221/CpyeE826secQKOg6AW-cC5eAu-S6esHwSlOyvS1G8Icw0he2K40h-nf_6M2IzA1CFP5q',
    
    ipAPIURL: 'https://api.ipify.org?format=json',
    storageKey: 'mcStaffTest_session'
};

// Questions Database
const QUESTIONS = [
    {
        id: 1,
        type: 'choice',
        question: 'На каком языке программирования пишутся плагины для сервера Minecraft (Bukkit/Spigot/Paper)?',
        options: ['Python', 'Java', 'C++', 'JavaScript'],
        correct: 1,
        category: 'Основы'
    },
    {
        id: 2,
        type: 'choice',
        question: 'Какой плагин чаще всего используется для управления правами игроков?',
        options: ['EssentialsX', 'LuckPerms', 'WorldEdit', 'Vault'],
        correct: 1,
        category: 'Плагины'
    },
    {
        id: 3,
        type: 'text',
        question: 'Напишите команду для выдачи группы "sponsor" игроку "uuun" через LuckPerms:',
        correctVariants: [
            'lp user uuun parent add sponsor',
            'lp user uuun parent set sponsor',
            'lp user uuun group add sponsor',
            'lp user uuun group set sponsor'
        ],
        displayCorrect: 'lp user uuun parent add sponsor',
        hint: 'Используйте команду lp user',
        category: 'Команды'
    },
    {
        id: 4,
        type: 'choice',
        question: 'Какой файл отвечает за основные настройки сервера Minecraft?',
        options: ['config.yml', 'server.properties', 'bukkit.yml', 'settings.json'],
        correct: 1,
        category: 'Конфигурация'
    },
    {
        id: 5,
        type: 'text',
        question: 'Напишите команду для выдачи 64 алмазов игроку Steve:',
        correctVariants: [
            'give steve diamond 64',
            'give steve diamonds 64',
            'give steve minecraft:diamond 64'
        ],
        displayCorrect: 'give Steve diamond 64',
        hint: 'Стандартная команда выдачи предметов',
        category: 'Команды'
    },
    {
        id: 6,
        type: 'code',
        question: 'Найдите ошибку в конфиге (строка 4). Что нужно исправить?',
        codeLines: [
            { num: 1, text: 'settings:', type: 'normal' },
            { num: 2, text: '  prefix: "&6[Server] "', type: 'normal' },
            { num: 3, text: '  messages:', type: 'normal' },
            { num: 4, text: '    welcome: "&aДобро пожаловать, %player%!', type: 'error' },
            { num: 5, text: '    goodbye: "&cДо свидания, %player%!"', type: 'normal' },
            { num: 6, text: '  enabled: true', type: 'normal' }
        ],
        errorLine: 4,
        checkKeywords: ['кавычк', 'закрыть', '"', 'quote', 'закрыта'],
        displayCorrect: 'Не закрыта кавычка в конце строки',
        hint: 'Посмотрите на кавычки в строке',
        category: 'Конфигурация'
    },
    {
        id: 7,
        type: 'choice',
        question: 'Какой порт по умолчанию использует Minecraft сервер?',
        options: ['25565', '8080', '3306', '22'],
        correct: 0,
        category: 'Основы'
    },
    {
        id: 8,
        type: 'text',
        question: 'Напишите команду для временного бана игрока "griefer" на 7 дней с причиной "Гриферство":',
        correctVariants: [
            'tempban griefer 7d гриферство',
            'tempban griefer 7d griefing',
            'tempban griefer 7days гриферство',
            'ban griefer 7d гриферство',
            'ban griefer 7d griefing',
            'tban griefer 7d гриферство'
        ],
        displayCorrect: 'tempban griefer 7d Гриферство',
        hint: 'Команда временного бана с указанием времени',
        category: 'Модерация'
    },
    {
        id: 9,
        type: 'code',
        question: 'Найдите ошибку в YAML конфиге (строка 7). В чём проблема?',
        codeLines: [
            { num: 1, text: 'groups:', type: 'normal' },
            { num: 2, text: '  default:', type: 'normal' },
            { num: 3, text: '    permissions:', type: 'normal' },
            { num: 4, text: '      - essentials.help', type: 'normal' },
            { num: 5, text: '      - essentials.spawn', type: 'normal' },
            { num: 6, text: '  vip:', type: 'normal' },
            { num: 7, text: '     - essentials.fly', type: 'error' },
            { num: 8, text: '      - essentials.heal', type: 'normal' },
            { num: 9, text: '    inheritance:', type: 'normal' },
            { num: 10, text: '      - default', type: 'normal' }
        ],
        errorLine: 7,
        checkKeywords: ['отступ', 'пробел', 'space', 'indent', '5', 'лишний', 'неправильн'],
        displayCorrect: 'Неправильный отступ (5 пробелов вместо 6)',
        hint: 'Проверьте количество пробелов',
        category: 'Конфигурация'
    },
    {
        id: 10,
        type: 'choice',
        question: 'Какая команда используется для перезагрузки всех плагинов на сервере?',
        options: ['/reload', '/restart', '/plugman reload', '/refresh'],
        correct: 0,
        category: 'Команды'
    }
];

// Application State
const state = {
    currentScreen: 'welcome',
    currentQuestion: 0,
    discordName: '',
    minecraftName: '',
    answers: [],
    questionTimes: [],
    questionStartTime: null,
    totalStartTime: null,
    tabAwayTime: 0,
    tabAwayStart: null,
    tabAwayCount: 0,
    isTabActive: true,
    userIP: 'Не определён',
    selectedOption: null,
    sessionId: null,
    isCompleted: false
};

// DOM Elements
const elements = {
    welcomeScreen: document.getElementById('welcome-screen'),
    registerScreen: document.getElementById('register-screen'),
    quizScreen: document.getElementById('quiz-screen'),
    resultsScreen: document.getElementById('results-screen'),
    startBtn: document.getElementById('start-btn'),
    registerForm: document.getElementById('register-form'),
    discordInput: document.getElementById('discord-name'),
    minecraftInput: document.getElementById('minecraft-name'),
    questionContainer: document.getElementById('question-container'),
    currentQuestionEl: document.getElementById('current-question'),
    totalQuestionsEl: document.getElementById('total-questions'),
    progressPercent: document.getElementById('progress-percent'),
    progressFill: document.getElementById('progress-fill'),
    timer: document.getElementById('timer'),
    nextBtn: document.getElementById('next-btn'),
    tabWarning: document.getElementById('tab-warning'),
    copyProtection: document.getElementById('copy-protection'),
    particles: document.getElementById('particles')
};

// ============================================
// INITIALIZATION
// ============================================

function init() {
    createParticles();
    setupEventListeners();
    getUserIP();
    checkExistingSession();
    elements.totalQuestionsEl.textContent = QUESTIONS.length;
}

// ============================================
// SESSION MANAGEMENT
// ============================================

function checkExistingSession() {
    const savedSession = localStorage.getItem(CONFIG.storageKey);
    
    if (savedSession) {
        try {
            const session = JSON.parse(savedSession);
            const sessionAge = Date.now() - session.startTime;
            const maxAge = 24 * 60 * 60 * 1000; // 24 часа
            
            if (sessionAge < maxAge) {
                state.sessionId = session.id;
                
                if (session.completed) {
                    showCompletedMessage();
                    return;
                }
                
                if (session.currentQuestion > 0) {
                    showResumeWarning(session);
                    return;
                }
            } else {
                localStorage.removeItem(CONFIG.storageKey);
            }
        } catch (e) {
            localStorage.removeItem(CONFIG.storageKey);
        }
    }
    
    state.sessionId = generateSessionId();
}

function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function showCompletedMessage() {
    elements.welcomeScreen.innerHTML = `
        <div class="logo-container">
            <div class="logo-glow"></div>
            <h1 class="main-title">
                <span class="title-line">ТЕСТ</span>
                <span class="title-line accent">ЗАВЕРШЁН</span>
            </h1>
        </div>
        
        <div class="decorative-line"></div>
        
        <div style="background: var(--bg-card); border: 2px solid var(--warning); border-radius: var(--border-radius-lg); padding: 30px; margin: 30px 0;">
            <div style="font-size: 3rem; margin-bottom: 15px;">⚠️</div>
            <h3 style="color: var(--warning); margin-bottom: 15px; font-family: 'Orbitron', sans-serif;">Вы уже прошли этот тест</h3>
            <p style="color: var(--text-secondary);">Повторное прохождение невозможно.<br>Ожидайте ответа от администрации.</p>
        </div>
        
        <p style="color: var(--text-muted); font-size: 0.9rem;">
            Если это ошибка, обратитесь к администратору
        </p>
    `;
}

function showResumeWarning(session) {
    const questionNum = session.currentQuestion + 1;
    
    elements.welcomeScreen.innerHTML = `
        <div class="logo-container">
            <div class="logo-glow"></div>
            <h1 class="main-title">
                <span class="title-line">ВНИМАНИЕ</span>
                <span class="title-line accent">⚠️</span>
            </h1>
        </div>
        
        <div class="decorative-line"></div>
        
        <div style="background: var(--bg-card); border: 2px solid var(--error); border-radius: var(--border-radius-lg); padding: 30px; margin: 30px 0;">
            <div style="font-size: 3rem; margin-bottom: 15px;">🚫</div>
            <h3 style="color: var(--error); margin-bottom: 15px; font-family: 'Orbitron', sans-serif;">Обнаружена попытка перезапуска</h3>
            <p style="color: var(--text-secondary); margin-bottom: 20px;">
                Вы начали тест и дошли до вопроса <strong>${questionNum}</strong>.<br>
                Перезагрузка страницы зафиксирована.
            </p>
            <div style="background: rgba(255, 51, 102, 0.1); padding: 15px; border-radius: 10px;">
                <p style="color: var(--error); font-size: 0.9rem;">
                    📊 Информация отправлена администрации
                </p>
            </div>
        </div>
        
        <button class="neon-button primary" onclick="forceRestart()">
            <span class="btn-content">Начать заново (результат аннулирован)</span>
            <div class="btn-glow"></div>
        </button>
    `;
    
    sendRestartNotification(session);
}

// Отправка в ЛОГ-канал о попытке рестарта
async function sendRestartNotification(session) {
    const embed = {
        title: '🔄 Попытка перезапуска теста',
        color: 0xff3366,
        fields: [
            { name: '👤 Discord', value: `\`${session.discordName || 'Не указан'}\``, inline: true },
            { name: '🎮 Minecraft', value: `\`${session.minecraftName || 'Не указан'}\``, inline: true },
            { name: '🌐 IP', value: `\`${state.userIP}\``, inline: true },
            { name: '📍 Остановился на', value: `Вопрос ${session.currentQuestion + 1}/${QUESTIONS.length}`, inline: true },
            { name: '✅ Правильных до рестарта', value: `${session.correctCount || 0}`, inline: true },
            { name: '👀 Уходов со вкладки', value: `${session.tabAwayCount || 0}`, inline: true }
        ],
        timestamp: new Date().toISOString()
    };
    
    await sendToWebhook(CONFIG.webhookLogs, embed);
}

function forceRestart() {
    localStorage.removeItem(CONFIG.storageKey);
    location.reload();
}
window.forceRestart = forceRestart;

function saveSession() {
    const session = {
        id: state.sessionId,
        startTime: state.totalStartTime,
        currentQuestion: state.currentQuestion,
        discordName: state.discordName,
        minecraftName: state.minecraftName,
        answers: state.answers,
        tabAwayCount: state.tabAwayCount,
        tabAwayTime: state.tabAwayTime,
        correctCount: state.answers.filter(a => a.isCorrect).length,
        completed: state.isCompleted
    };
    
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(session));
}

// ============================================
// PARTICLES
// ============================================

function createParticles() {
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        
        const colors = ['var(--primary)', 'var(--secondary)', 'var(--accent)'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.boxShadow = `0 0 10px ${particle.style.background}`;
        
        elements.particles.appendChild(particle);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    elements.startBtn.addEventListener('click', () => showScreen('register'));

    elements.registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        state.discordName = elements.discordInput.value.trim();
        state.minecraftName = elements.minecraftInput.value.trim();
        startQuiz();
    });

    elements.nextBtn.addEventListener('click', nextQuestion);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Copy protection
    document.addEventListener('copy', preventCopy);
    document.addEventListener('cut', preventCopy);
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && ['c', 'C', 'x', 'X', 'u', 'U'].includes(e.key)) {
            e.preventDefault();
            showCopyWarning();
        }
    });
}

function handleBeforeUnload(e) {
    if (state.currentScreen === 'quiz' && !state.isCompleted) {
        saveSession();
        sendLeaveNotification();
        e.preventDefault();
        e.returnValue = 'Вы уверены? Прогресс будет потерян.';
        return e.returnValue;
    }
}

// Отправка в ЛОГ-канал о выходе
async function sendLeaveNotification() {
    if (state.answers.length === 0) return;
    
    const correctCount = state.answers.filter(a => a.isCorrect).length;
    
    const embed = {
        title: '🚪 Пользователь покинул тест',
        color: 0xffaa00,
        thumbnail: { url: `https://mc-heads.net/avatar/${state.minecraftName}/128` },
        fields: [
            { name: '👤 Discord', value: `\`${state.discordName}\``, inline: true },
            { name: '🎮 Minecraft', value: `\`${state.minecraftName}\``, inline: true },
            { name: '🌐 IP', value: `\`${state.userIP}\``, inline: true },
            { name: '📍 Остановился на', value: `Вопрос ${state.currentQuestion + 1}/${QUESTIONS.length}`, inline: true },
            { name: '✅ Правильных', value: `${correctCount}/${state.answers.length}`, inline: true },
            { name: '👀 Уходов', value: `${state.tabAwayCount} (${state.tabAwayTime.toFixed(1)}с)`, inline: true }
        ],
        timestamp: new Date().toISOString()
    };
    
    // sendBeacon для надёжной отправки при закрытии
    const data = JSON.stringify({
        username: 'Staff Test Bot',
        avatar_url: 'https://i.imgur.com/oBPXx0D.png',
        embeds: [embed]
    });
    
    navigator.sendBeacon(CONFIG.webhookLogs, new Blob([data], { type: 'application/json' }));
}

// ============================================
// SCREEN MANAGEMENT
// ============================================

function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    const screens = {
        'welcome': elements.welcomeScreen,
        'register': elements.registerScreen,
        'quiz': elements.quizScreen,
        'results': elements.resultsScreen
    };
    
    screens[screenName].classList.add('active');
    state.currentScreen = screenName;
}

// ============================================
// IP DETECTION
// ============================================

async function getUserIP() {
    try {
        const response = await fetch(CONFIG.ipAPIURL);
        const data = await response.json();
        state.userIP = data.ip;
    } catch (error) {
        console.error('Could not fetch IP:', error);
    }
}

// ============================================
// QUIZ FUNCTIONS
// ============================================

function startQuiz() {
    state.currentQuestion = 0;
    state.answers = [];
    state.questionTimes = [];
    state.totalStartTime = Date.now();
    state.tabAwayTime = 0;
    state.tabAwayCount = 0;
    state.selectedOption = null;
    
    saveSession();
    showScreen('quiz');
    renderQuestion();
    startTimer();
}

function renderQuestion() {
    const question = QUESTIONS[state.currentQuestion];
    state.questionStartTime = Date.now();
    state.selectedOption = null;
    
    // Update progress
    elements.currentQuestionEl.textContent = state.currentQuestion + 1;
    const progress = ((state.currentQuestion) / QUESTIONS.length) * 100;
    elements.progressFill.style.width = progress + '%';
    elements.progressPercent.textContent = Math.round(progress) + '%';
    
    elements.nextBtn.disabled = true;
    
    let html = `
        <div class="question-number">
            Вопрос ${state.currentQuestion + 1}
            <span class="question-type">${question.category}</span>
        </div>
        <div class="question-text">${question.question}</div>
    `;
    
    switch (question.type) {
        case 'choice':
            html += renderChoiceQuestion(question);
            break;
        case 'text':
            html += renderTextQuestion(question);
            break;
        case 'code':
            html += renderCodeQuestion(question);
            break;
    }
    
    elements.questionContainer.innerHTML = html;
    
    if (question.type === 'choice') {
        setupChoiceListeners();
    } else {
        setupInputListeners();
    }
    
    saveSession();
}

// ============================================
// CHOICE QUESTIONS
// ============================================

function renderChoiceQuestion(question) {
    const letters = ['A', 'B', 'C', 'D'];
    let html = '<div class="options-container">';
    
    question.options.forEach((option, index) => {
        html += `
            <button class="option-btn" data-index="${index}">
                <span class="option-letter">${letters[index]}</span>
                <span class="option-text">${option}</span>
                <span class="option-icon"></span>
            </button>
        `;
    });
    
    html += '</div>';
    html += `
        <div class="confirm-container" style="margin-top: 25px; text-align: center;">
            <button class="neon-button primary" id="confirm-choice-btn" disabled>
                <span class="btn-content">Подтвердить ответ</span>
                <div class="btn-glow"></div>
            </button>
        </div>
    `;
    
    return html;
}

function setupChoiceListeners() {
    const confirmBtn = document.getElementById('confirm-choice-btn');
    
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('locked')) return;
            
            document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            state.selectedOption = parseInt(this.dataset.index);
            confirmBtn.disabled = false;
        });
    });
    
    confirmBtn.addEventListener('click', () => {
        if (state.selectedOption === null) return;
        
        const question = QUESTIONS[state.currentQuestion];
        const isCorrect = state.selectedOption === question.correct;
        
        document.querySelectorAll('.option-btn').forEach(b => b.classList.add('locked'));
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span class="btn-content">✓ Ответ принят</span>';
        
        const selectedBtn = document.querySelector(`.option-btn[data-index="${state.selectedOption}"]`);
        selectedBtn.classList.remove('selected');
        selectedBtn.classList.add(isCorrect ? 'correct' : 'wrong');
        selectedBtn.querySelector('.option-icon').textContent = isCorrect ? '✓' : '✗';
        
        if (!isCorrect) {
            const correctBtn = document.querySelector(`.option-btn[data-index="${question.correct}"]`);
            correctBtn.classList.add('correct');
            correctBtn.querySelector('.option-icon').textContent = '✓';
        }
        
        recordAnswer(question.options[state.selectedOption], isCorrect);
        elements.nextBtn.disabled = false;
    });
}

// ============================================
// TEXT QUESTIONS
// ============================================

function renderTextQuestion(question) {
    return `
        <div class="text-input-container">
            <label class="text-input-label">Ваш ответ:</label>
            <input type="text" class="text-input neon-input" id="text-answer" 
                   placeholder="Введите команду..." autocomplete="off" spellcheck="false">
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 10px;">
                💡 ${question.hint}
            </p>
            <button class="neon-button primary submit-answer-btn" id="submit-text-btn" disabled style="margin-top: 15px;">
                <span class="btn-content">Ответить</span>
                <div class="btn-glow"></div>
            </button>
        </div>
    `;
}

// ============================================
// CODE QUESTIONS - ИСПРАВЛЕННАЯ ВЕРСИЯ
// ============================================

function renderCodeQuestion(question) {
    let codeHtml = '';
    
    // Используем новый формат codeLines
    question.codeLines.forEach(line => {
        const lineClass = line.type === 'error' ? 'code-line error-line' : 'code-line';
        // Безопасное отображение текста
        const safeText = escapeHtml(line.text);
        // Подсветка после экранирования
        const highlighted = highlightYaml(safeText);
        
        codeHtml += `<div class="${lineClass}"><span class="line-num">${line.num}</span><span class="line-content">${highlighted}</span></div>`;
    });
    
    return `
        <div class="code-container">
            <div class="code-header">
                <span class="code-filename">📄 config.yml</span>
                <span class="code-lang">YAML</span>
            </div>
            <div class="code-block">${codeHtml}</div>
        </div>
        <div class="text-input-container">
            <label class="text-input-label">Опишите ошибку или напишите исправление:</label>
            <input type="text" class="text-input neon-input" id="text-answer" 
                   placeholder="Например: закрыть кавычку, убрать лишний пробел..." 
                   autocomplete="off" spellcheck="false">
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 10px;">
                💡 ${question.hint}
            </p>
            <button class="neon-button primary submit-answer-btn" id="submit-text-btn" disabled style="margin-top: 15px;">
                <span class="btn-content">Ответить</span>
                <div class="btn-glow"></div>
            </button>
        </div>
    `;
}

// Безопасное экранирование HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Подсветка YAML ПОСЛЕ экранирования
function highlightYaml(text) {
    // Комментарии (# в начале после пробелов)
    if (/^\s*#/.test(text)) {
        return `<span class="hl-comment">${text}</span>`;
    }
    
    let result = text;
    
    // Ключи (слово: ) - НЕ ВНУТРИ СТРОК
    result = result.replace(/^(\s*)([a-zA-Z_][a-zA-Z0-9_-]*)(:)/, 
        '$1<span class="hl-key">$2</span><span class="hl-colon">$3</span>');
    
    // Строки в кавычках (уже экранированы как &quot;)
    result = result.replace(/(&quot;[^&]*&quot;)/g, '<span class="hl-string">$1</span>');
    
    // Булевые значения
    result = result.replace(/:\s*(true|false)(\s*)$/gi, ': <span class="hl-bool">$1</span>$2');
    
    // Числа
    result = result.replace(/:\s*(\d+)(\s*)$/g, ': <span class="hl-number">$1</span>$2');
    
    // Списки (-)
    result = result.replace(/^(\s*)(-)(\s)/, '$1<span class="hl-dash">$2</span>$3');
    
    return result;
}

// ============================================
// INPUT LISTENERS (text & code)
// ============================================

function setupInputListeners() {
    const submitBtn = document.getElementById('submit-text-btn');
    const input = document.getElementById('text-answer');
    const question = QUESTIONS[state.currentQuestion];
    
    input.addEventListener('input', () => {
        submitBtn.disabled = input.value.trim().length === 0;
    });
    
    submitBtn.addEventListener('click', () => {
        const answer = input.value.trim();
        if (!answer) return;
        
        let isCorrect;
        if (question.type === 'code') {
            isCorrect = checkCodeAnswer(answer, question);
        } else {
            isCorrect = checkTextAnswer(answer, question);
        }
        
        recordAnswer(answer, isCorrect);
        
        input.classList.add(isCorrect ? 'correct' : 'wrong');
        input.disabled = true;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="btn-content">✓ Ответ принят</span>';
        
        showAnswerResult(input, isCorrect, question.displayCorrect);
        elements.nextBtn.disabled = false;
    });
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !submitBtn.disabled) {
            submitBtn.click();
        }
    });
}

function showAnswerResult(input, isCorrect, correctAnswer) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'answer-result ' + (isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
        resultDiv.innerHTML = `<span class="result-icon">✓</span> Правильно!`;
    } else {
        resultDiv.innerHTML = `
            <span class="result-icon">✗</span> Неправильно
            <div class="correct-answer">
                <strong>Правильный ответ:</strong><br>
                <code>${correctAnswer}</code>
            </div>
        `;
    }
    
    input.parentNode.appendChild(resultDiv);
}

function checkTextAnswer(answer, question) {
    const normalized = normalizeCommand(answer);
    
    if (question.correctVariants) {
        return question.correctVariants.some(v => normalizeCommand(v) === normalized);
    }
    return false;
}

function checkCodeAnswer(answer, question) {
    const lower = answer.toLowerCase();
    
    if (question.checkKeywords) {
        return question.checkKeywords.some(kw => lower.includes(kw.toLowerCase()));
    }
    return false;
}

function normalizeCommand(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/^\/+/, '')
        .replace(/\s+/g, ' ');
}

// ============================================
// ANSWER RECORDING
// ============================================

function recordAnswer(answer, isCorrect) {
    const timeSpent = (Date.now() - state.questionStartTime) / 1000;
    const question = QUESTIONS[state.currentQuestion];
    
    state.answers.push({
        questionId: question.id,
        question: question.question,
        answer: answer,
        correctAnswer: question.displayCorrect || 
            (typeof question.correct === 'number' ? question.options[question.correct] : question.correct),
        isCorrect: isCorrect,
        timeSpent: timeSpent
    });
    
    state.questionTimes.push(timeSpent);
    saveSession();
}

// ============================================
// NAVIGATION
// ============================================

function nextQuestion() {
    state.currentQuestion++;
    
    if (state.currentQuestion >= QUESTIONS.length) {
        finishQuiz();
    } else {
        renderQuestion();
    }
}

function finishQuiz() {
    state.isCompleted = true;
    saveSession();
    
    showScreen('results');
    calculateResults();
    sendFinalResults();
}

// ============================================
// RESULTS
// ============================================

function calculateResults() {
    const correctCount = state.answers.filter(a => a.isCorrect).length;
    const wrongCount = state.answers.length - correctCount;
    const avgTime = state.questionTimes.reduce((a, b) => a + b, 0) / state.questionTimes.length;
    const percent = (correctCount / QUESTIONS.length) * 100;
    
    document.getElementById('score-value').textContent = correctCount;
    document.getElementById('correct-count').textContent = correctCount;
    document.getElementById('wrong-count').textContent = wrongCount;
    document.getElementById('avg-time').textContent = avgTime.toFixed(1) + 'с';
    document.getElementById('percent-correct').textContent = Math.round(percent) + '%';
    
    // Animate score ring
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (percent / 100) * circumference;
    
    setTimeout(() => {
        const ring = document.getElementById('score-ring-fill');
        if (ring) ring.style.strokeDashoffset = offset;
    }, 300);
    
    // Add gradient
    const svg = document.querySelector('.score-ring');
    if (svg && !svg.querySelector('defs')) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:var(--primary)"/>
                <stop offset="100%" style="stop-color:var(--secondary)"/>
            </linearGradient>
        `;
        svg.insertBefore(defs, svg.firstChild);
    }
    
    // Results message
    let icon, title, message;
    if (percent >= 80) {
        icon = '🎉'; title = 'Отличный результат!';
        message = 'Вы отлично знаете материал! Ожидайте ответа.';
    } else if (percent >= 60) {
        icon = '👍'; title = 'Хороший результат!';
        message = 'Неплохо, но есть над чем поработать.';
    } else if (percent >= 40) {
        icon = '📚'; title = 'Нужно подучить';
        message = 'Рекомендуем изучить документацию.';
    } else {
        icon = '💪'; title = 'Не сдавайтесь!';
        message = 'Изучите материалы и попробуйте снова.';
    }
    
    document.getElementById('results-icon').textContent = icon;
    document.getElementById('results-title').textContent = title;
    document.getElementById('results-message').textContent = message;
}

// ============================================
// TIMER
// ============================================

let timerInterval;

function startTimer() {
    const startTime = Date.now();
    
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        elements.timer.textContent = `${minutes}:${seconds}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

// ============================================
// TAB VISIBILITY
// ============================================

function handleVisibilityChange() {
    if (state.currentScreen !== 'quiz') return;
    
    if (document.hidden) {
        state.isTabActive = false;
        state.tabAwayStart = Date.now();
        state.tabAwayCount++;
        elements.tabWarning.classList.add('active');
        
        // Отправляем уведомление в лог
        sendTabAwayNotification();
        saveSession();
    } else {
        state.isTabActive = true;
        if (state.tabAwayStart) {
            const awayTime = (Date.now() - state.tabAwayStart) / 1000;
            state.tabAwayTime += awayTime;
            state.tabAwayStart = null;
        }
        elements.tabWarning.classList.remove('active');
        saveSession();
    }
}

// Отправка в ЛОГ-канал об уходе со вкладки
async function sendTabAwayNotification() {
    const embed = {
        title: '👀 Уход со вкладки',
        color: 0xffaa00,
        fields: [
            { name: '👤 Discord', value: `\`${state.discordName}\``, inline: true },
            { name: '🎮 Minecraft', value: `\`${state.minecraftName}\``, inline: true },
            { name: '📍 Вопрос', value: `${state.currentQuestion + 1}/${QUESTIONS.length}`, inline: true },
            { name: '🔢 Раз ушёл', value: `${state.tabAwayCount}`, inline: true }
        ],
        timestamp: new Date().toISOString()
    };
    
    await sendToWebhook(CONFIG.webhookLogs, embed);
}

// ============================================
// COPY PROTECTION
// ============================================

function preventCopy(e) {
    e.preventDefault();
    showCopyWarning();
}

function showCopyWarning() {
    elements.copyProtection.classList.add('show');
    setTimeout(() => elements.copyProtection.classList.remove('show'), 2000);
}

// ============================================
// WEBHOOK HELPERS
// ============================================

async function sendToWebhook(url, embed) {
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'Staff Test Bot',
                avatar_url: 'https://i.imgur.com/oBPXx0D.png',
                embeds: [embed]
            })
        });
    } catch (error) {
        console.error('Webhook error:', error);
    }
}

// Итоговые результаты в ОСНОВНОЙ канал
async function sendFinalResults() {
    const correctCount = state.answers.filter(a => a.isCorrect).length;
    const wrongCount = state.answers.length - correctCount;
    const avgTime = state.questionTimes.reduce((a, b) => a + b, 0) / state.questionTimes.length;
    const minTime = Math.min(...state.questionTimes);
    const maxTime = Math.max(...state.questionTimes);
    const totalTime = (Date.now() - state.totalStartTime) / 1000;
    const percent = ((correctCount / QUESTIONS.length) * 100).toFixed(1);
    
    // Build answers
    let answersText = '';
    state.answers.forEach((a, i) => {
        const status = a.isCorrect ? '✅' : '❌';
        answersText += `**${i + 1}.** ${status}\n`;
        answersText += `> Ответ: \`${a.answer}\`\n`;
        if (!a.isCorrect) {
            answersText += `> Правильно: \`${a.correctAnswer}\`\n`;
        }
        answersText += `> Время: ${a.timeSpent.toFixed(1)}с\n\n`;
    });
    
    let color = percent >= 80 ? 0x00ff88 : percent >= 60 ? 0xffaa00 : 0xff3366;
    
    const embed = {
        title: '📋 Тест завершён',
        color: color,
        thumbnail: { url: `https://mc-heads.net/avatar/${state.minecraftName}/128` },
        fields: [
            { name: '👤 Discord', value: `\`${state.discordName}\``, inline: true },
            { name: '🎮 Minecraft', value: `\`${state.minecraftName}\``, inline: true },
            { name: '🌐 IP', value: `\`${state.userIP}\``, inline: true },
            { name: '📊 Результат', value: `**${correctCount}/${QUESTIONS.length}** (${percent}%)`, inline: true },
            { name: '✅ Правильных', value: `${correctCount}`, inline: true },
            { name: '❌ Неправильных', value: `${wrongCount}`, inline: true },
            { name: '⏱️ Среднее время', value: `${avgTime.toFixed(1)} сек`, inline: true },
            { name: '⚡ Мин. время', value: `${minTime.toFixed(1)} сек`, inline: true },
            { name: '🐌 Макс. время', value: `${maxTime.toFixed(1)} сек`, inline: true },
            { name: '📱 Общее время', value: `${Math.floor(totalTime / 60)}м ${Math.floor(totalTime % 60)}с`, inline: true },
            { name: '👀 Уходов', value: `${state.tabAwayCount} (${state.tabAwayTime.toFixed(1)}с)`, inline: true },
            { name: '\u200b', value: '\u200b', inline: true },
            { name: '📝 Подробные ответы', value: answersText.substring(0, 1024) || 'Нет данных' }
        ],
        footer: { text: `Session: ${state.sessionId}` },
        timestamp: new Date().toISOString()
    };
    
    if (answersText.length > 1024) {
        embed.fields.push({
            name: '📝 Ответы (продолжение)',
            value: answersText.substring(1024, 2048) || '...'
        });
    }
    
    await sendToWebhook(CONFIG.webhookResults, embed);
    stopTimer();
}

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', init);