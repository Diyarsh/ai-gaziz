const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const micButton = document.getElementById('micButton');
const soundWaveIcon = document.getElementById('soundWaveIcon');
const avatarImage = document.getElementById('avatarImage');

let isRecording = false;
let recognition = null;

// Initialize speech recognition if available
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        stopRecording();
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopRecording();
    };
    
    recognition.onend = () => {
        stopRecording();
    };
}

// Sample responses for demonstration
const sampleResponses = {
    'прирост': 'Прирост поддержки отечественных товаров за 9 месяцев 2025 года по сравнению с аналогичным периодом прошлого года составил 75%. За 9 месяцев 2025 года объем закупок у отечественных производителей составил 721 млрд тенге, заключено 7227 договоров с 497 производителями. За аналогичный период 2024 года объем закупок составил 411 млрд тенге, заключено 414 договоров с 516 производителями. План закупок на 2025 год составляет 1370 млрд тенге, план будет значительно перевыполнен, в том числе за счет сделки по закупке локомотивов у отечественного производителя, принадлежащего Vabtek. Закупки осуществляются ежедневно, показатели могут изменяться динамически.',
    'план': 'План закупок на 2025 год составляет 1370 млрд тенге. Текущие показатели показывают, что план будет значительно перевыполнен.',
    'договор': 'За 9 месяцев 2025 года заключено 7227 договоров с 497 отечественными производителями.',
    'объем': 'Объем закупок у отечественных производителей за 9 месяцев 2025 года составил 721 млрд тенге.',
    'производитель': 'За 9 месяцев 2025 года компания работает с 497 отечественными производителями.',
    'default': 'Спасибо за ваш вопрос. Я виртуальный помощник и готов помочь вам с информацией о компании QazaqGaz. Чем я еще могу помочь?'
};

// Function to add message to chat
function addMessage(text, isQuestion = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isQuestion ? 'message-question' : 'message-answer'}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    
    messageDiv.appendChild(bubble);
    
    if (!isQuestion) {
        const actions = document.createElement('div');
        actions.className = 'message-actions';
        
        const playButton = document.createElement('button');
        playButton.className = 'play-button';
        playButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 2L13 8L3 14V2Z" fill="currentColor"/>
            </svg>
            Воспроизвести ответ
        `;
        playButton.addEventListener('click', () => {
            // Text-to-speech functionality
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'ru-RU';
                utterance.rate = 0.9;
                speechSynthesis.speak(utterance);
            }
        });
        
        actions.appendChild(playButton);
        messageDiv.appendChild(actions);
    }
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Function to get response based on user input
function getResponse(userText) {
    const lowerText = userText.toLowerCase();
    
    // Check for keywords
    for (const [keyword, response] of Object.entries(sampleResponses)) {
        if (keyword !== 'default' && lowerText.includes(keyword)) {
            return response;
        }
    }
    
    return sampleResponses.default;
}

// Function to toggle between mic and send button
function toggleInputButton() {
    const hasText = userInput.value.trim().length > 0;
    
    if (hasText) {
        micButton.style.display = 'none';
        sendButton.style.display = 'flex';
    } else {
        micButton.style.display = 'flex';
        sendButton.style.display = 'none';
    }
}

// Function to send message
function sendMessage() {
    const text = userInput.value.trim();
    
    if (!text) return;
    
    // Add user question
    addMessage(text, true);
    
    // Disable input while processing
    userInput.disabled = true;
    sendButton.disabled = true;
    
    // Simulate AI thinking delay
    setTimeout(() => {
        const response = getResponse(text);
        addMessage(response, false);
        
        // Re-enable input
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.value = '';
        toggleInputButton();
        userInput.focus();
    }, 800);
}

// Function to start recording
function startRecording() {
    if (!recognition) {
        alert('Голосовой ввод не поддерживается в вашем браузере');
        return;
    }
    
    isRecording = true;
    micButton.classList.add('active');
    soundWaveIcon.style.display = 'flex';
    userInput.placeholder = 'Говорите...';
    
    try {
        recognition.start();
    } catch (error) {
        console.error('Error starting recognition:', error);
        stopRecording();
    }
}

// Function to stop recording
function stopRecording() {
    isRecording = false;
    micButton.classList.remove('active');
    soundWaveIcon.style.display = 'none';
    userInput.placeholder = 'Задайте вопрос...';
    toggleInputButton();
    
    if (recognition && recognition.state !== 'inactive') {
        try {
            recognition.stop();
        } catch (error) {
            console.error('Error stopping recognition:', error);
        }
    }
}

// Event listeners
sendButton.addEventListener('click', sendMessage);

micButton.addEventListener('click', () => {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
});

userInput.addEventListener('input', () => {
    toggleInputButton();
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (isRecording) {
            stopRecording();
        }
        sendMessage();
    }
});

// Handle avatar image error - use placeholder if image not found
avatarImage.addEventListener('error', function() {
    this.src = 'data:image/svg+xml,%3Csvg width="400" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="400" height="500" fill="%230077B6"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle"%3EАватар%3C/text%3E%3C/svg%3E';
    console.log('Avatar image not found. Please add avatar.png to the project directory.');
});

// Focus input on load
window.addEventListener('load', () => {
    toggleInputButton();
    userInput.focus();
});

