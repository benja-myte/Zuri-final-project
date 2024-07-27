document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Dummy credentials for demonstration
    const validEmail = 'admin@gmail.com';
    const validPassword = 'password123';

    if (email === validEmail && password === validPassword) {
        alert('Login successful!');
        window.location.href = 'welcome.html'; // Redirect to a new page
    } else {
        errorMessage.textContent = 'Invalid email or password';
    }
});
