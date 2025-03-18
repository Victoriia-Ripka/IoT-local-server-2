import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import matplotlib.pyplot as plt

data = pd.read_json('data/energy_data.json')

data['timestamp'] = pd.to_datetime(data['time'])
data['timestamp'] = data['timestamp'].astype(np.int64) // 10**9

X = data[['timestamp', 'current']].values

model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
model.fit(X)
predictions = model.predict(X)

anomalies = model.predict(X)
data['anomaly'] = anomalies

plt.figure(figsize=(10,6))
plt.plot(data['timestamp'], data['current'], label='Energy Consumption')
plt.scatter(data['timestamp'][data['anomaly'] == -1], data['current'][data['anomaly'] == -1], color='red', label='Anomalies')
plt.xlabel('Timestamp')
plt.ylabel('Current (A)')
plt.legend()
plt.show()