const socket = io();  // Use lowercase 'socket' for common convention

// Check if geolocation is available
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            // Emit user's current location to the server
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

// Initialize Leaflet map with a default view
const map = L.map("map").setView([0, 0], 16);

// Add tile layer from OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Huzaifa Fiaz"
}).addTo(map);

// Dictionary to store markers by user ID
const markers = {};

// Listen for location updates from other users
socket.on("received-location", (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude]);  // Center the map on the new location
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);  // Update marker position
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);  // Create a new marker
    }
});

// Remove marker when a user disconnects
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);  // Remove marker from the map
        delete markers[id];  // Delete marker from the dictionary
    }
});
