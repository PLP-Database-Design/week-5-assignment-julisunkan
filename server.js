// Import required modules
const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create an instance of an Express application
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Create a MySQL connection using the configuration from .env
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to MySQL database...');
});

// GET endpoint to retrieve patients details
app.get('/patients', (req, res) => {
    db.query('SELECT patient_id, first_name, last_name, date_of_birth FROM patients', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// GET endpoint to retrieve all providers
app.get('/providers', (req, res) => {
    db.query('SELECT first_name, last_name, provider_specialty FROM providers', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// GET endpoint to retrieve patients by first name
app.get('/patients/firstname', (req, res) => {
    db.query(
        `SELECT first_name, 
                COUNT(*) AS count,
                GROUP_CONCAT(CONCAT(last_name, ' (', date_of_birth, ')') ORDER BY last_name SEPARATOR ', ') AS details 
         FROM patients 
         GROUP BY first_name`,
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Return the grouped list of patients
            res.json(results);
        }
    );
});


// GET endpoint to retrieve providers by specialty
app.get('/providers/specialty', (req, res) => {
    db.query(
        `SELECT provider_specialty, 
                COUNT(*) AS count,
                GROUP_CONCAT(CONCAT(first_name, ' ', last_name) ORDER BY last_name SEPARATOR ', ') AS providers 
         FROM providers 
         GROUP BY provider_specialty`,
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Return the grouped list of providers
            res.json(results);
        }
    );
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
