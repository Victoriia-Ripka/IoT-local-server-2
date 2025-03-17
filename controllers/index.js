import axios from 'axios';

const THRESHOLD_UP = 1.5;
const THRESHOLD_DOWN = 0.5;

// Метод для перевірки різких змін
export function checkForAnomalies(data) {
    const last5 = data.slice(-5);

    if (last5.length < 5) {
        return; // Якщо даних менше 5, немає чого перевіряти
    }

    const currentValue = last5[last5.length - 1].current;
    const previousValues = last5.slice(0, 4);

    // Перевіряємо на різке зростання
    for (let i = 0; i < previousValues.length; i++) {
        const prevValue = previousValues[i].current;

        if (currentValue > prevValue * THRESHOLD_UP) {
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

// Функція для надсилання даних аномалії до системи
function sendAnomalyData(type, value) {
    const anomalyData = {
        type: type, // "rise" or "drop"
        value: value,
        timestamp: new Date().toISOString()
    };

    axios.post(`http://localhost:${port}/api/anomaly`, anomalyData)
        .then(response => {
            console.log('Anomaly data sent to the system:', response.data);
        })
        .catch(error => {
            console.error('Error sending anomaly data:', error.message);
        });
}