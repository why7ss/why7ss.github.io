// ============================================
// MINECRAFT STAFF TEST - MAIN APPLICATION
// ============================================

// Configuration
const CONFIG = {
    webhookURL: 'https://discord.com/api/webhooks/1489390914672529459/st-SOKXZ85hQaTQ7reICAMQgB-uR08kXgFaL6d7z6CAVLMZIYZ271IHfbnctXga_NWO7', // Замените на ваш webhook
    ipAPIURL: 'https://api.ipify.org?format=json'
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
        correct: '/lp user uuun parent add sponsor',
        hint: 'Формат: /lp user [ник] parent add [группа]',
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
        correct: '/give Steve diamond 64',
        hint: 'Формат: /give [ник] [предмет] [количество]',
        category: 'Команды'
    },
    {
        id: 6,
        type: 'code',
        question: 'Найдите и исправьте ошибку в конфигурации. Напишите исправленную строку:',
        code: `# config.yml - Настройки приветствия
settings:
  prefix: "&6[Server] "
  messages:
    welcome: "&aДобро пожаловать, %player%!
    goodbye: "&cДо свидания, %player%!"
  enabled: true`,
        errorLine: 5,
        correct: '    welcome: "&aДобро пожаловать, %player%!"',
        hint: 'Проверьте кавычки в строке welcome',
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
        correct: '/tempban griefer 7d Гриферство',
        hint: 'Формат: /tempban [ник] [время] [причина]',
        category: 'Модерация'
    },
    {
        id: 9,
        type: 'code',
        question: 'Исправьте ошибку в YAML конфиге. Напишите исправленную строку:',
        code: `# permissions.yml
groups:
  default:
    permissions:
      - essentials.help
      - essentials.spawn
    inheritance: []
  vip:
    permissions:
      - essentials.fly
     - essentials.heal
    inheritance:
      - default`,
        errorLine: 11,
        correct: '      - essentials.heal',
        hint: 'Проверьте отступы (пробелы) в списке permissions',
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
    isTabActive: true,
    userIP: 'Не определён'
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

// Initialize Application
function init() {
    createParticles();
    setupEventListeners();
    getUserIP();
    elements.totalQuestionsEl.textContent = QUESTIONS.length;
}

// Create Floating Particles
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

// Setup Event Listeners
function setupEventListeners() {
    // Start Button
    elements.startBtn.addEventListener('click', () => {
        showScreen('register');
    });

    // Register Form
    elements.registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        state.discordName = elements.discordInput.value.trim();
        state.minecraftName = elements.minecraftInput.value.trim();
        startQuiz();
    });

    // Next Button
    elements.nextBtn.addEventListener('click', nextQuestion);

    // Tab Visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Copy Protection
    document.addEventListener('copy', preventCopy);
    document.addEventListener('cut', preventCopy);
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'x' || e.key === 'X' || e.key === 'u' || e.key === 'U')) {
            e.preventDefault();
            showCopyWarning();
        }
    });
}

// Screen Management
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const screenMap = {
        'welcome': elements.welcomeScreen,
        'register': elements.registerScreen,
        'quiz': elements.quizScreen,
        'results': elements.resultsScreen
    };
    
    screenMap[screenName].classList.add('active');
    state.currentScreen = screenName;
}

// Get User IP
async function getUserIP() {
    try {
        const response = await fetch(CONFIG.ipAPIURL);
        const data = await response.json();
        state.userIP = data.ip;
    } catch (error) {
        console.error('Could not fetch IP:', error);
    }
}

// Quiz Functions
function startQuiz() {
    state.currentQuestion = 0;
    state.answers = [];
    state.questionTimes = [];
    state.totalStartTime = Date.now();
    state.tabAwayTime = 0;
    
    showScreen('quiz');
    renderQuestion();
    startTimer();
}

function renderQuestion() {
    const question = QUESTIONS[state.currentQuestion];
    state.questionStartTime = Date.now();
    
    // Update progress
    elements.currentQuestionEl.textContent = state.currentQuestion + 1;
    const progress = ((state.currentQuestion) / QUESTIONS.length) * 100;
    elements.progressFill.style.width = progress + '%';
    elements.progressPercent.textContent = Math.round(progress) + '%';
    
    // Disable next button
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
    
    // Add event listeners based on question type
    if (question.type === 'choice') {
        setupChoiceListeners();
    } else {
        setupInputListeners();
    }
}

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
    return html;
}

function renderTextQuestion(question) {
    return `
        <div class="text-input-container">
            <label class="text-input-label">Ваш ответ:</label>
            <input type="text" class="text-input neon-input" id="text-answer" 
                   placeholder="Введите команду..." autocomplete="off">
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 10px;">
                💡 ${question.hint}
            </p>
            <button class="neon-button primary submit-answer-btn" id="submit-text-btn">
                <span class="btn-content">Ответить</span>
                <div class="btn-glow"></div>
            </button>
        </div>
    `;
}

function renderCodeQuestion(question) {
    const lines = question.code.split('\n');
    let codeHtml = '';
    
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        const isError = lineNum === question.errorLine;
        const highlightedLine = highlightSyntax(line);
        
        codeHtml += `<span class="${isError ? 'error-line' : ''}"><span class="line-number">${lineNum}</span>${highlightedLine}\n</span>`;
    });
    
    return `
        <div class="code-container">
            <div class="code-header">
                <span class="code-filename">📄 config.yml</span>
                <span class="code-lang">YAML</span>
            </div>
            <div class="code-block">
                <pre>${codeHtml}</pre>
            </div>
        </div>
        <div class="text-input-container">
            <label class="text-input-label">Исправленная строка ${question.errorLine}:</label>
            <input type="text" class="text-input neon-input" id="text-answer" 
                   placeholder="Введите исправленную строку..." autocomplete="off">
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 10px;">
                💡 ${question.hint}
            </p>
            <button class="neon-button primary submit-answer-btn" id="submit-text-btn">
                <span class="btn-content">Ответить</span>
                <div class="btn-glow"></div>
            </button>
        </div>
    `;
}

function highlightSyntax(line) {
    // Simple YAML syntax highlighting
    return line
        .replace(/^(\s*#.*)$/g, '<span class="comment">$1</span>')
        .replace(/^(\s*[\w-]+):/g, '<span class="property">$1</span>:')
        .replace(/"([^"]*)"/g, '"<span class="string">$1</span>"')
        .replace(/'([^']*)'/g, '"<span class="string">$1</span>"')
        .replace(/:\s*(\d+)\s*$/g, ': <span class="number">$1</span>')
        .replace(/:\s*(true|false)\s*$/gi, ': <span class="keyword">$1</span>');
}

function setupChoiceListeners() {
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.disabled) return;
            
            const selectedIndex = parseInt(this.dataset.index);
            const question = QUESTIONS[state.currentQuestion];
            const isCorrect = selectedIndex === question.correct;
            
            // Record answer
            recordAnswer(question.options[selectedIndex], isCorrect);
            
            // Disable all buttons
            document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
            
            // Show correct/wrong
            this.classList.add(isCorrect ? 'correct' : 'wrong');
            this.querySelector('.option-icon').textContent = isCorrect ? '✓' : '✗';
            
            // Show correct answer if wrong
            if (!isCorrect) {
                const correctBtn = document.querySelector(`.option-btn[data-index="${question.correct}"]`);
                correctBtn.classList.add('correct');
                correctBtn.querySelector('.option-icon').textContent = '✓';
            }
            
            // Enable next button
            elements.nextBtn.disabled = false;
        });
    });
}

function setupInputListeners() {
    const submitBtn = document.getElementById('submit-text-btn');
    const input = document.getElementById('text-answer');
    
    submitBtn.addEventListener('click', () => {
        const answer = input.value.trim();
        if (!answer) return;
        
        const question = QUESTIONS[state.currentQuestion];
        const isCorrect = normalizeAnswer(answer) === normalizeAnswer(question.correct);
        
        // Record answer
        recordAnswer(answer, isCorrect);
        
        // Visual feedback
        input.classList.add(isCorrect ? 'correct' : 'wrong');
        input.disabled = true;
        submitBtn.disabled = true;
        
        // Show correct answer if wrong
        if (!isCorrect) {
            const correctDiv = document.createElement('div');
            correctDiv.style.cssText = `
                margin-top: 15px;
                padding: 15px;
                background: rgba(0, 255, 136, 0.1);
                border: 1px solid var(--success);
                border-radius: var(--border-radius);
                color: var(--success);
            `;
            correctDiv.innerHTML = `<strong>Правильный ответ:</strong><br><code style="color: var(--success);">${question.correct}</code>`;
            input.parentNode.appendChild(correctDiv);
        }
        
        elements.nextBtn.disabled = false;
    });
    
    // Allow Enter to submit
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    });
}

function normalizeAnswer(str) {
    return str.toLowerCase().replace(/\s+/g, ' ').trim();
}

function recordAnswer(answer, isCorrect) {
    const timeSpent = (Date.now() - state.questionStartTime) / 1000;
    
    state.answers.push({
        questionId: QUESTIONS[state.currentQuestion].id,
        question: QUESTIONS[state.currentQuestion].question,
        answer: answer,
        correct: QUESTIONS[state.currentQuestion].correct,
        isCorrect: isCorrect,
        timeSpent: timeSpent
    });
    
    state.questionTimes.push(timeSpent);
}

function nextQuestion() {
    state.currentQuestion++;
    
    if (state.currentQuestion >= QUESTIONS.length) {
        finishQuiz();
    } else {
        renderQuestion();
    }
}

function finishQuiz() {
    showScreen('results');
    calculateResults();
    sendToDiscord();
}

function calculateResults() {
    const correctCount = state.answers.filter(a => a.isCorrect).length;
    const wrongCount = state.answers.length - correctCount;
    const avgTime = state.questionTimes.reduce((a, b) => a + b, 0) / state.questionTimes.length;
    const percent = (correctCount / QUESTIONS.length) * 100;
    
    // Update UI
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
        ring.style.strokeDashoffset = offset;
    }, 300);
    
    // Add gradient definition to SVG
    const svg = document.querySelector('.score-ring');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:var(--primary)"/>
            <stop offset="100%" style="stop-color:var(--secondary)"/>
        </linearGradient>
    `;
    svg.insertBefore(defs, svg.firstChild);
    
    // Results message
    let message, icon, title;
    if (percent >= 80) {
        icon = '🎉';
        title = 'Отличный результат!';
        message = 'Вы отлично знаете материал! Ожидайте ответа от администрации.';
    } else if (percent >= 60) {
        icon = '👍';
        title = 'Хороший результат!';
        message = 'Неплохие знания, но есть над чем поработать.';
    } else if (percent >= 40) {
        icon = '📚';
        title = 'Нужно подучить';
        message = 'Рекомендуем изучить документацию и попробовать снова.';
    } else {
        icon = '💪';
        title = 'Не сдавайтесь!';
        message = 'Изучите материалы по администрированию серверов и попробуйте снова.';
    }
    
    document.getElementById('results-icon').textContent = icon;
    document.getElementById('results-title').textContent = title;
    document.getElementById('results-message').textContent = message;
}

// Timer
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

// Tab Visibility Handling
function handleVisibilityChange() {
    if (state.currentScreen !== 'quiz') return;
    
    if (document.hidden) {
        // Tab became hidden
        state.isTabActive = false;
        state.tabAwayStart = Date.now();
        elements.tabWarning.classList.add('active');
    } else {
        // Tab became visible
        state.isTabActive = true;
        if (state.tabAwayStart) {
            state.tabAwayTime += (Date.now() - state.tabAwayStart) / 1000;
            state.tabAwayStart = null;
        }
        elements.tabWarning.classList.remove('active');
    }
}

// Copy Protection
function preventCopy(e) {
    e.preventDefault();
    showCopyWarning();
}

function showCopyWarning() {
    elements.copyProtection.classList.add('show');
    setTimeout(() => {
        elements.copyProtection.classList.remove('show');
    }, 2000);
}

// Send Results to Discord
async function sendToDiscord() {
    const correctCount = state.answers.filter(a => a.isCorrect).length;
    const wrongCount = state.answers.length - correctCount;
    const avgTime = state.questionTimes.reduce((a, b) => a + b, 0) / state.questionTimes.length;
    const minTime = Math.min(...state.questionTimes);
    const maxTime = Math.max(...state.questionTimes);
    const totalTime = (Date.now() - state.totalStartTime) / 1000;
    const percent = ((correctCount / QUESTIONS.length) * 100).toFixed(1);
    
    // Build answers details
    let answersText = '';
    state.answers.forEach((a, i) => {
        const status = a.isCorrect ? '✅' : '❌';
        answersText += `**${i + 1}.** ${status} ${a.isCorrect ? 'Верно' : 'Неверно'}\n`;
        answersText += `> Ответ: \`${a.answer}\`\n`;
        if (!a.isCorrect) {
            const correctAnswer = typeof a.correct === 'number' 
                ? QUESTIONS[i].options[a.correct] 
                : a.correct;
            answersText += `> Правильно: \`${correctAnswer}\`\n`;
        }
        answersText += `> Время: ${a.timeSpent.toFixed(1)}с\n\n`;
    });
    
    // Color based on result
    let color;
    if (percent >= 80) color = 0x00ff88;
    else if (percent >= 60) color = 0xffaa00;
    else color = 0xff3366;
    
    const embed = {
        title: '📋 Новый результат теста',
        color: color,
        thumbnail: {
            url: `https://mc-heads.net/avatar/${state.minecraftName}/128`
        },
        fields: [
            {
                name: '👤 Discord',
                value: `\`${state.discordName}\``,
                inline: true
            },
            {
                name: '🎮 Minecraft',
                value: `\`${state.minecraftName}\``,
                inline: true
            },
            {
                name: '🌐 IP Адрес',
                value: `\`${state.userIP}\``,
                inline: true
            },
            {
                name: '📊 Результат',
                value: `**${correctCount}/${QUESTIONS.length}** (${percent}%)`,
                inline: true
            },
            {
                name: '✅ Правильных',
                value: `${correctCount}`,
                inline: true
            },
            {
                name: '❌ Неправильных',
                value: `${wrongCount}`,
                inline: true
            },
            {
                name: '⏱️ Среднее время',
                value: `${avgTime.toFixed(1)} сек`,
                inline: true
            },
            {
                name: '⚡ Мин. время',
                value: `${minTime.toFixed(1)} сек`,
                inline: true
            },
            {
                name: '🐌 Макс. время',
                value: `${maxTime.toFixed(1)} сек`,
                inline: true
            },
            {
                name: '📱 Общее время',
                value: `${Math.floor(totalTime / 60)}м ${Math.floor(totalTime % 60)}с`,
                inline: true
            },
            {
                name: '👀 Время вне вкладки',
                value: `${state.tabAwayTime.toFixed(1)} сек`,
                inline: true
            },
            {
                name: '📝 Подробные ответы',
                value: answersText.substring(0, 1024) || 'Нет данных'
            }
        ],
        footer: {
            text: 'Minecraft Staff Test System'
        },
        timestamp: new Date().toISOString()
    };
    
    // If answers are too long, add additional field
    if (answersText.length > 1024) {
        embed.fields[embed.fields.length - 1].value = answersText.substring(0, 1024);
        
        if (answersText.length > 1024) {
            embed.fields.push({
                name: '📝 Подробные ответы (продолжение)',
                value: answersText.substring(1024, 2048) || '...'
            });
        }
    }
    
    try {
        await fetch(CONFIG.webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'Staff Test Bot',
                avatar_url: 'https://i.imgur.com/oBPXx0D.png',
                embeds: [embed]
            })
        });
        console.log('Results sent to Discord');
    } catch (error) {
        console.error('Failed to send to Discord:', error);
    }
    
    stopTimer();
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);