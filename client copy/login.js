// login.js

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    let socket;

    // Check if the current page is the login page
    if (loginForm) {
        // Connect to the server via WebSocket
        socket = io();

        // Handle the login form submission
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Send the login credentials to the server for authentication
            socket.emit('login', { username, password });

            // Clear the login form
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        });
    }
});