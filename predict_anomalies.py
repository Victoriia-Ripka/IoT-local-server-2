import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import matplotlib.pyplot as plt

# Загрузка історичних даних
data = pd.read_json('energy_data.json')

# Преобразуем час в числові значення (наприклад, мілісекунди з початку)
data['timestamp'] = pd.to_datetime(data['time'])
data['timestamp'] = data['timestamp'].astype(np.int64) // 10**9  # Перетворення в секунди

# Використовуємо тільки потужність і час для тренування моделі
X = data[['timestamp', 'current']].values

# Навчання моделі Isolation Forest для виявлення аномалій
model = IsolationForest(contamination=0.1)
model.fit(X)

# Прогнозування аномалій
anomalies = model.predict(X)
data['anomaly'] = anomalies

# Візуалізація результатів
plt.figure(figsize=(10,6))
plt.plot(data['timestamp'], data['current'], label='Energy Consumption')
plt.scatter(data['timestamp'][data['anomaly'] == -1], data['current'][data['anomaly'] == -1], color='red', label='Anomalies')
plt.xlabel('Timestamp')
plt.ylabel('Current (A)')
plt.legend()
plt.show()