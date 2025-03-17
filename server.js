const express = require('express');
const mqtt = require('mqtt');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const DATA_FILE = 'energy_data.json';

app.use(bodyParser.json());
app.use(express.json()); 
app.use(cors());

const mqttClient = mqtt.connect('mqtt://test.mosquitto.org');
const mqttTopic = 'home/energy';

mqttClient.on('connect', () => {
    console.log(`Connected to MQTT broker`);
    mqttClient.subscribe(mqttTopic);
});

mqttClient.on('message', (topic, message) => {
    if (topic === mqttTopic) {
        try {
            const payload = JSON.parse(message.toString());

            if (!payload || typeof payload.current !== 'number') {
                throw new Error("Invalid payload format");
            }

            const energyEntry = { time: new Date().toISOString(), current: payload.current };
            
            let data = [];
            if (fs.existsSync(DATA_FILE)) {
                const fileData = fs.readFileSync(DATA_FILE, 'utf-8');
                if (fileData.trim()) { 
                    data = JSON.parse(fileData);
                }
            }

            data.push(energyEntry);
            fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
            console.log(`Saved data: ${JSON.stringify(energyEntry)}`);

        } catch (error) {
            console.error("Error processing MQTT message:", error.message);
        }
    }
});

// API для отримання історичних даних
app.get('/api/data', (req, res) => {
    if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE));
        res.json(data.slice(-50));
    } else {
        res.json([]);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});