// backend code
const mongoose = require('mongoose');
const flightSchema = new mongoose.Schema({
    icao24: { type: String, required: true },
    callsign: { type: String, required: true },
    originCountry: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    altitude: { type: Number, required: true },
    velocity: { type: Number, required: true },
    heading: { type: Number, required: true },
    onGround: { type: Boolean, required: true },
    squawk: { type: String, required: true },
});

module.exports = mongoose.model('Flight', flightSchema);

// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const flightRoutes = require('./routes/flights');

dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/flights', flightRoutes);
app.listen(port, () => {
    console.log(`Flight tracker backend running at http://localhost:${port}`);
});

// routes/flights.js
const express = require('express');
const Flight = require('../models/Flight');
const router = express.Router();

// Get all flights
router.get('/', async (req, res) => {
    try {
        const flights = await Flight.find();
        res.json(flights);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new flight
router.post('/', async (req, res) => {
    const flight = new Flight(req.body);
    try {
        const newFlight = await flight.save();
        res.status(201).json(newFlight);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update flight positions
router.post('/update', async (req, res) => {
    try {
        const flights = await Flight.find();
        flights.forEach(flight => {
            if (!flight.onGround) {
                flight.latitude += (Math.random() - 0.5) * 0.1;  // Randomize latitude
                flight.longitude += (Math.random() - 0.5) * 0.1; // Randomize longitude
                flight.save();
            }
        });
        res.json(flights);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

// populate.js
const mongoose = require('mongoose');
const Flight = require('./models/Flight');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('MongoDB connected');
        
        // Sample flight data
        const flights = [
            { icao24: "abc123", callsign: "AI123", originCountry: "India", latitude: 28.6139, longitude: 77.2090, altitude: 12000, velocity: 400, heading: 90, onGround: false, squawk: "7201" },
            { icao24: "def456", callsign: "SG456", originCountry: "India", latitude: 19.0760, longitude: 72.8777, altitude: 11000, velocity: 390, heading: 120, onGround: false, squawk: "7400" },
            { icao24: "ghi789", callsign: "6E789", originCountry: "India", latitude: 12.9716, longitude: 77.5946, altitude: 10000, velocity: 380, heading: 80, onGround: false, squawk: "7500" },
            { icao24: "jkl012", callsign: "EK123", originCountry: "UAE", latitude: 25.276987, longitude: 55.296249, altitude: 15000, velocity: 450, heading: 70, onGround: false, squawk: "7600" },
            { icao24: "mno345", callsign: "BA345", originCountry: "UK", latitude: 51.5074, longitude: -0.1278, altitude: 13000, velocity: 420, heading: 95, onGround: false, squawk: "7700" },
            // Add more flights as needed...
        ];

        await Flight.insertMany(flights);
        console.log('Flights populated!');
        
        mongoose.connection.close();
    })
    .catch(err => console.error('MongoDB connection error:', err));
