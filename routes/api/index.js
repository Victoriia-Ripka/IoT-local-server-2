const express = require('express');
const fs = require('fs');
const { PythonShell } = require('python-shell');
// const axios = require('axios');
const router = express.Router();

const DATA_FILE = 'data/energy_data.json';
const port = process.env.PORT || 3000;

router.get('/data', (req, res) => {
    if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE));
        res.json(data.slice(-50));
    } else {
        res.json([]);
    }
});

// Predict anomalies using Python script
router.get('/predict', (req, res) => {
    PythonShell.run('predict_anomalies.py', null, (err, result) => {
        if (err) {
            console.error('Error running Python script:', err);
            res.status(500).send('Server Error');
        } else {
            const anomalies = JSON.parse(result[0]);
            res.json({ anomalies });
        }
    });
});

// Anomaly detection route
router.post('/anomaly', (req, res) => {
    const { type, value, timestamp } = req.body;
    console.log(`Received anomaly data: Type - ${type}, Value - ${value}, Timestamp - ${timestamp}`);
    res.status(200).json({ message: 'Anomaly data received successfully!' });
});

module.exports = router;