// client.js

document.addEventListener('DOMContentLoaded', function () {
    const chatArea = document.getElementById('chatArea');
    const messageInput = document.getElementById('messageInput');
    const sendMessageButton = document.getElementById('sendMessage');
    const socket = io();

    // Function to display chat messages in the chat area
    function displayMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.textContent = sender + ': ' + message;
        chatArea.appendChild(messageElement);
    }

    // Function to fetch and display chat messages from the API
    function fetchChatMessages() {
        fetch('http://localhost:3000/api/messages')
            .then((response) => response.json())
            .then((data) => {
                data.forEach((message) => {
                    displayMessage(message.sender, message.text);
                });
            })
            .catch((error) => {
                console.error('Error fetching chat messages:', error);
            });
    }

    // Check if the user is authenticated
    fetch('http://localhost:3000/api/authenticated')
        .then((response) => response.json())
        .then((data) => {
            if (data.authenticated) {
                // User is authenticated, continue with chat functionality
                const username = data.username;

                // Fetch and display chat messages
                fetchChatMessages();

                // Event listener for sending chat messages
                sendMessageButton.addEventListener('click', function () {
                    const message = messageInput.value.trim();
                    if (message !== '') {
                        // Display the message locally
                        displayMessage(username, message);

                        // Send the message to the server via Socket.io
                        socket.emit('message', { sender: username, text: message });

                        // Clear the message input
                        messageInput.value = '';
                    }
                });

                // Listen for incoming messages from the server via Socket.io
                socket.on('message', function (message) {
                    displayMessage(message.sender, message.text);
                });

            } else {
                // User is not authenticated, redirect to login page
                window.location.href = '/login';
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});