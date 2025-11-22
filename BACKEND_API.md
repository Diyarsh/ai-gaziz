# Backend API Specification для интеграции с Frontend

## Обзор

Этот документ описывает API эндпоинты, которые необходимо реализовать на бэкенде для интеграции с фронтенд приложением Aqyl AI Assistant.

## Технологии Frontend

- **HTML5** + **CSS3** + **Vanilla JavaScript**
- Статический сайт без фреймворков
- Web Speech API для голосового ввода

---

## 1. Аутентификация

### 1.1. Логин

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "Admin User"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Неверное имя пользователя или пароль"
}
```

**Текущая реализация (frontend):**
- Файл: `script.js`
- Логика: проверка `username === 'admin' && password === 'admin'`
- После успешного входа: редирект на `assistant.html`

**Что нужно изменить:**
- Заменить проверку на API вызов к `/api/auth/login`
- Сохранить токен в `localStorage` или `sessionStorage`
- Использовать токен для последующих запросов

---

## 2. AI Assistant Chat API

### 2.1. Отправка сообщения

**Endpoint:** `POST /api/chat/message`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "Какой прирост поддержки отечественных товаров?",
  "session_id": "optional-session-id"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "response": "Прирост поддержки отечественных товаров за 9 месяцев 2025 года по сравнению с аналогичным периодом прошлого года составил 75%...",
  "session_id": "session-uuid-12345"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Требуется аутентификация"
}
```

**Текущая реализация (frontend):**
- Файл: `assistant.js`
- Функция: `sendMessage()`
- Логика: локальные ответы на основе ключевых слов
- Примеры ключевых слов: "прирост", "план", "договор", "объем", "производитель"

**Что нужно изменить:**
- Заменить локальную логику на API вызов к `/api/chat/message`
- Добавить обработку ошибок
- Добавить индикатор загрузки во время запроса

---

## 3. Голосовой ввод

### 3.1. Распознавание речи (опционально)

**Endpoint:** `POST /api/chat/voice`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body:**
```
audio: [audio file blob]
format: "webm" или "wav"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "transcript": "Какой прирост поддержки отечественных товаров?",
  "confidence": 0.95
}
```

**Текущая реализация (frontend):**
- Файл: `assistant.js`
- Использует Web Speech API браузера (`SpeechRecognition`)
- Язык: `ru-RU`
- После распознавания текст автоматически вставляется в поле ввода

**Что нужно изменить (если нужна серверная обработка):**
- Записать аудио в blob
- Отправить на сервер для распознавания
- Получить транскрипт и вставить в поле ввода

---

## 4. Структура файлов Frontend

```
ai-gaziz/
├── index.html          # Страница входа
├── assistant.html      # Интерфейс AI-ассистента
├── styles.css          # Стили для страницы входа
├── assistant.css       # Стили для ассистента
├── script.js           # Логика входа (нужно интегрировать с API)
├── assistant.js        # Логика чата (нужно интегрировать с API)
├── logo-act.svg        # Логотип
└── avatar.png          # Аватар ассистента
```

---

## 5. Интеграция с Frontend

### 5.1. Настройка API Base URL

Создайте файл `config.js`:

```javascript
const API_CONFIG = {
  baseURL: 'https://your-backend-api.com/api',
  // или для разработки:
  // baseURL: 'http://localhost:3001/api',
};
```

### 5.2. Обновление script.js (логин)

Замените текущую логику входа:

```javascript
// Текущий код (строки 1-25 в script.js)
// Заменить на:

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'assistant.html';
        } else {
            // Показать ошибку
            showError(data.error);
        }
    } catch (error) {
        showError('Ошибка подключения к серверу');
    }
});
```

### 5.3. Обновление assistant.js (чат)

Замените функцию `sendMessage()`:

```javascript
// Текущий код (строки 72-95 в assistant.js)
// Заменить на:

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;
    
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    addMessage(text, true);
    userInput.disabled = true;
    sendButton.disabled = true;
    
    try {
        const response = await fetch(`${API_CONFIG.baseURL}/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message: text })
        });
        
        const data = await response.json();
        
        if (data.success) {
            addMessage(data.response, false);
        } else {
            addMessage('Извините, произошла ошибка. Попробуйте еще раз.', false);
        }
    } catch (error) {
        addMessage('Ошибка подключения к серверу', false);
    } finally {
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.value = '';
        userInput.focus();
        toggleInputButton();
    }
}
```

---

## 6. CORS настройки

Убедитесь, что бэкенд разрешает запросы с фронтенда:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 7. Безопасность

1. **Токены**: Используйте JWT токены с истечением срока действия
2. **HTTPS**: Обязательно используйте HTTPS в продакшене
3. **Валидация**: Валидируйте все входные данные на бэкенде
4. **Rate Limiting**: Ограничьте количество запросов от одного пользователя

---

## 8. Примеры запросов

### cURL для логина:
```bash
curl -X POST https://your-backend-api.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

### cURL для отправки сообщения:
```bash
curl -X POST https://your-backend-api.com/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"message":"Какой прирост поддержки отечественных товаров?"}'
```

---

## 9. Контакты

Если у бэкенд-разработчика возникнут вопросы по интеграции, он может:
1. Изучить текущую реализацию в `script.js` и `assistant.js`
2. Проверить структуру HTML в `index.html` и `assistant.html`
3. Посмотреть примеры ответов в функции `getResponse()` в `assistant.js`

---

## 10. Дополнительные возможности (опционально)

### 10.1. История чата
- **Endpoint:** `GET /api/chat/history`
- Возвращает историю сообщений пользователя

### 10.2. Управление сессиями
- Сохранение контекста разговора
- Поддержка нескольких сессий

### 10.3. Аналитика
- Отслеживание популярных вопросов
- Статистика использования

