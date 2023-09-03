// const express = require('express');
// const app = express();
// const http = require('http');


// const port=process.env.PORT || 3000;

// app.listen(port,()=>{
//     console.log(`Listening on port ${port}`);
// });

// app.use(express.static(__dirname+'/Chat'));

// app.get('/', (req, res)=>{
//     res.sendFile(__dirname+'/index.html');
// });

// //Socket
// const io= require('socket.io')(http)//socket.io is working on http server

// io.on('connection',(socket)=>{  //whenever any client or browser is connected then this func is called
//     console.log('Connected...');

//     socket.on('message',(msg)=>{
//         socket.broadcast.emit('message', msg);
//     });
// });

// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// app.use(express.static("client"));
// const path = require("path");
// app.get("/", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "client",  "index.html"));
// });


// // Serve your HTML, CSS, and JavaScript files here

// io.on('connection', (socket) => {
//     console.log('A user connected');

//     // Listen for messages from the client
//     socket.on('message', (message) => {
//         // Broadcast the message to all connected clients, including the sender
//         io.broadcast.emit('message', message);
//     });

//     // Handle disconnections
//     socket.on('disconnect', () => {
//         console.log('A user disconnected');
//     });
// });

// server.listen(3000, () => {
//     console.log('Server is running on http://localhost:3000');
// });

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressSession = require('express-session');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the client folder
app.use(express.static(path.join(__dirname, 'client')));

// Enable session support for passport with a secret key
app.use(expressSession({ secret: 'ashish', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Define a simple user database (replace with your user management logic)
const users = [
    { id: 1, username: 'user1', password: 'password1' },
    { id: 2, username: 'user2', password: 'password2' },
];

// Configure passport to serialize and deserialize users
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    const user = users.find((u) => u.id === id);
    done(null, user);
});

// Configure passport local strategy for authentication
passport.use(
    new LocalStrategy((username, password, done) => {
        const user = users.find((u) => u.username === username);
        if (!user || user.password !== password) {
            return done(null, false, { message: 'Incorrect username or password' });
        }
        return done(null, user);
    })
);

// Middleware to check if a user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

// Chat route (protected with isAuthenticated middleware)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'login.html'));
});

// Authentication route (POST request)
app.post('/login', passport.authenticate('local', {
    successRedirect: '/chat',
    failureRedirect: '/login',
    failureFlash: true, // Enable flash messages for displaying errors
}));

// Chat route (protected with isAuthenticated middleware)
app.get('/chat', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

io.on('connection', (socket) => {
    if (socket.request.isAuthenticated()) {
        const username = socket.request.user.username;
        console.log('A user connected: ' + username);

        // Listen for messages from the client
        socket.on('message', (message) => {
            // Broadcast the message to all connected clients, including the sender
            io.emit('message', {
                sender: username,
                text: message,
            });
        });

        // Handle disconnections
        socket.on('disconnect', () => {
            console.log('A user disconnected: ' + username);
        });

    } else {
        console.log('A non-authenticated user connected.');
        // Handle non-authenticated user behavior, if needed.
    }
});

// API endpoint for user login status
app.get('/api/authenticated', (req, res) => {
    if (req.isAuthenticated()) {
        // User is authenticated
        res.json({ authenticated: true, username: req.user.username });
    } else {
        // User is not authenticated
        res.json({ authenticated: false });
    }
});

// API endpoint for retrieving chat messages
app.get('/api/messages', isAuthenticated, (req, res) => {
    // Replace this with your actual data source for chat messages
    const chatMessages = [
        { sender: 'User1', text: 'Hello' },
        { sender: 'User2', text: 'Hi there' },
        // Add more chat messages here
    ];

    res.json(chatMessages);
});

// Start the server on port 3000
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});