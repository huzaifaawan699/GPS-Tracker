const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

// Create an HTTP server
const server = http.createServer(app);

// Initialize socket.io for real-time communication
const io = socketio(server);

// Set EJS as the view engine
app.set("view engine", "ejs");

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Handle socket connections
io.on("connection", function(socket) {
    console.log(`New user connected: ${socket.id}`);

    // Receive location data from client and broadcast it to all users
    socket.on("send-location", function(data) {
        io.emit("received-location", { id: socket.id, ...data });
    });

    // Handle user disconnection
    socket.on("disconnect", function() {
        io.emit("user-disconnected", socket.id);
    });
});

// Serve the index page
app.get("/", function(req, res) {
    res.render('index');
});

// Start the server on port 3000
server.listen(3000, function() {
    console.log('Server is running on http://localhost:3000');
});
