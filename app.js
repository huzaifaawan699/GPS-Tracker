const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const morgan = require('morgan'); // For logging HTTP requests

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Middleware for logging requests
app.use(morgan('dev'));

// Set EJS as the view engine
app.set("view engine", "ejs");

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Handle socket connections
io.on("connection", (socket) => {
    console.log(`New user connected: ${socket.id}`);

    // Receive location data from client and broadcast it to all users
    socket.on("send-location", (data) => {
        console.log(`Location received from ${socket.id}:`, data); // Log received location
        io.emit("received-location", { id: socket.id, ...data });
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        io.emit("user-disconnected", socket.id);
    });
});

// Serve the index page
app.get("/", (req, res) => {
    res.render('index');
});

// Handle 404 errors for unmatched routes
app.use((req, res) => {
    res.status(404).send("Sorry, that route doesn't exist.");
});

// Start the server on port 3000 or the port specified by the environment
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
