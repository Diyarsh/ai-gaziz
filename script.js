document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    // Remove previous error message if exists
    if (errorMessage) {
        errorMessage.remove();
    }
    
    // Check credentials
    if (username === 'admin' && password === 'admin') {
        // Successful login - redirect to assistant page
        window.location.href = 'assistant.html';
    } else {
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.id = 'errorMessage';
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Неверное имя пользователя или пароль';
        document.querySelector('.login-form').appendChild(errorDiv);
        
        // Clear password field
        document.getElementById('password').value = '';
    }
});

