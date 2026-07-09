import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { N8N_WEBHOOK_URL } from './config';

// Pantallas de la app: 'request' -> 'loading' -> 'result'
export default function App() {
  const [screen, setScreen] = useState('request');
  const [prompt, setPrompt] = useState('');
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState(null);

  const requestTaxi = async () => {
    if (!prompt.trim()) {
      Alert.alert('Falta información', 'Escribe de dónde sales y a dónde vas.');
      return;
    }

    setError(null);
    setScreen('loading');

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`El servidor respondió con estado ${response.status}`);
      }

      const data = await response.json();
      setTrip(data);
      setScreen('result');
    } catch (err) {
      console.error(err);
      setError(
        'No se pudo contactar a n8n. Verifica que el contenedor esté ' +
          'corriendo y que el celular esté en la misma red Wi-Fi que la PC.'
      );
      setScreen('request');
    }
  };

  const resetTrip = () => {
    setPrompt('');
    setTrip(null);
    setScreen('request');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>🚕 Taxi AI</Text>

        {screen === 'request' && (
          <View style={styles.card}>
            <Text style={styles.label}>¿A dónde vamos?</Text>
            <Text style={styles.hint}>
              Ej: "Necesito un taxi de Zona Río a Otay"
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Escribe tu viaje aquí..."
              placeholderTextColor="#8a8a8a"
              value={prompt}
              onChangeText={setPrompt}
              multiline
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity style={styles.button} onPress={requestTaxi}>
              <Text style={styles.buttonText}>Solicitar taxi</Text>
            </TouchableOpacity>
          </View>
        )}

        {screen === 'loading' && (
          <View style={styles.card}>
            <ActivityIndicator size="large" color="#ffd23f" />
            <Text style={styles.label}>Buscando el conductor más cercano...</Text>
            <Text style={styles.hint}>La IA está procesando tu solicitud en n8n</Text>
          </View>
        )}

        {screen === 'result' && trip && (
          <View style={styles.card}>
            <Text style={styles.label}>¡Viaje asignado! ✅</Text>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Origen</Text>
              <Text style={styles.rowValue}>{trip.origin}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Destino</Text>
              <Text style={styles.rowValue}>{trip.destination}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Conductor</Text>
              <Text style={styles.rowValue}>{trip.driver?.name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Auto</Text>
              <Text style={styles.rowValue}>{trip.driver?.car}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Placas</Text>
              <Text style={styles.rowValue}>{trip.driver?.plate}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Distancia</Text>
              <Text style={styles.rowValue}>{trip.distanceKm} km</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Tiempo estimado</Text>
              <Text style={styles.rowValue}>{trip.etaMinutes} min</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={resetTrip}>
              <Text style={styles.buttonText}>Solicitar otro viaje</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#101820',
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffd23f',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1c2733',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  hint: {
    fontSize: 13,
    color: '#9aa5b1',
    textAlign: 'center',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0f171f',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2c3947',
    color: '#ffffff',
    padding: 14,
    minHeight: 70,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  error: {
    color: '#ff6b6b',
    fontSize: 13,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#ffd23f',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#101820',
    fontWeight: '700',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: '#9aa5b1',
    fontSize: 14,
  },
  rowValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#2c3947',
    marginVertical: 4,
  },
});
