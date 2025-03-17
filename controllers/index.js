const mqtt = require('mqtt');
const axios = require('axios');

const mqttClient = mqtt.connect('mqtt://test.mosquitto.org');

const THRESHOLD_RISE = 1.5;
const THRESHOLD_DOWN = 0.5;
const HIGH_CONSUMPTION_THRESHOLD = 8;

function checkForAnomalies(data) {
    const last5 = data.slice(-5);

    if (last5.length < 5) {
        return;
    }

    const currentValue = last5[last5.length - 1].current;
    const previousValues = last5.slice(0, 4);

    if (currentValue > HIGH_CONSUMPTION_THRESHOLD) {
        console.log('Anomaly detected: High energy consumption!');
        mqttClient.publish('home/energy_alert', JSON.stringify({
            message: 'High energy consumption detected!',
            value: currentValue
        }));

        sendAnomalyData('high', currentValue);
        return;
    }

    for (let i = 0; i < previousValues.length; i++) {
        const prevValue = previousValues[i].current;

        if (currentValue > prevValue * THRESHOLD_RISE) {
            console.log('Anomaly detected: critical rise in energy consumption!');
            mqttClient.publish('home/energy_alert', JSON.stringify({
                message: 'Critical rise in energy consumption!',
                value: currentValue
            }));

            // Надсилаємо дані до системи
            sendAnomalyData('rise', currentValue);

            break;
        }

        // Перевіряємо на різке падіння
        if (currentValue < prevValue * THRESHOLD_DOWN) {
            console.log('Anomaly detected: critical drop in energy consumption!');
            mqttClient.publish('home/energy_alert', JSON.stringify({
                message: 'Critical drop in energy consumption!',
                value: currentValue
            }));

            // Надсилаємо дані до системи
            sendAnomalyData('drop', currentValue);

            break;
        }
    }
}

function sendAnomalyData(type, value) {
    const anomalyData = {
        type: type,  // high / rise / drop
        value: value,
        timestamp: new Date().toISOString()
    };

    axios.post(`http://localhost:3000/api/anomaly`, anomalyData)
        .then(response => {
            console.log('Anomaly data sent to the system:', response.data);
        })
        .catch(error => {
            console.error('Error sending anomaly data:', error.message);
        });
}

module.exports = { checkForAnomalies };