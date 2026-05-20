import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Keyboard,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { fetchDDD } from '../services/api';
import { DddResponse } from '../types/dddTypes';

const DddScreen: React.FC = () => {
  const [ddd, setDdd] = useState<string>('');
  const [data, setData] = useState<DddResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (ddd.length > 0 && data) {
      setData(null);
      setError(null);
    }
  }, [ddd]);

  useEffect(() => {
    if (data || error) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [data, error]);

  const buscarDDD = async () => {
    Keyboard.dismiss();

    if (!/^\d{2}$/.test(ddd)) {
      setError('Digite um DDD válido com 2 dígitos (ex: 11, 21, 31)');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const resultado = await fetchDDD(ddd);
      setData(resultado);
    } catch (err: any) {
      setError(err.message || 'Falha na conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E30613" />
          <Text style={styles.loadingText}>Consultando DDD {ddd}...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <Animated.View
          style={[
            styles.errorContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <MaterialIcons name="error-outline" size={48} color="#E30613" />
          <Text style={styles.errorTitle}>Ops! Algo deu errado</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={buscarDDD}>
            <Feather name="refresh-cw" size={16} color="#FFF" />
            <Text style={styles.retryButtonText}> Tentar novamente</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    if (data) {
      // Ordena as cidades em ordem alfabética (com acentos)
      const sortedCities = [...data.cities].sort((a, b) =>
        a.localeCompare(b, 'pt-BR')
      );

      return (
        <Animated.View
          style={[
            styles.resultContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.stateCard}>
            <Text style={styles.stateLabel}>ESTADO</Text>
            <Text style={styles.stateValue}>{data.state}</Text>
          </View>

          <View style={styles.citiesSection}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="location-on" size={22} color="#E30613" />
              <Text style={styles.citiesTitle}>
                Cidades atendidas ({data.cities.length})
              </Text>
            </View>
            <View style={styles.citiesList}>
              {sortedCities.map((city, index) => (
                <View key={index} style={styles.cityCard}>
                  <MaterialIcons
                    name="location-city"
                    size={20}
                    color="#E30613"
                    style={styles.cityIcon}
                  />
                  <Text style={styles.cityName}>{city}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="phone-android" size={64} color="#888" />
        <Text style={styles.emptyTitle}>Nenhuma consulta ainda</Text>
        <Text style={styles.emptyText}>
          Digite um DDD acima e clique em buscar para ver as cidades atendidas
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Consulta de DDD</Text>
          <Text style={styles.headerSubtitle}>
            Descubra estado e cidades por código de área
          </Text>
        </View>

        <View style={styles.searchCard}>
          <Text style={styles.inputLabel}>Código DDD</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 11, 21, 31"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={2}
            value={ddd}
            onChangeText={setDdd}
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={buscarDDD}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Feather name="search" size={18} color="#FFF" />
            <Text style={styles.buttonText}> Buscar</Text>
          </TouchableOpacity>
        </View>

        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#E30613',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFD0D0',
    textAlign: 'center',
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '500',
    color: '#1A1A1A',
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#E30613',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonDisabled: {
    backgroundColor: '#888',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#1A1A1A',
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E30613',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E30613',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#E30613',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  stateCard: {
    backgroundColor: '#E30613',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#E30613',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  stateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD0D0',
    letterSpacing: 1,
    marginBottom: 8,
  },
  stateValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  citiesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  citiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  citiesList: {
    paddingBottom: 8,
  },
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cityIcon: {
    marginRight: 12,
  },
  cityName: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default DddScreen;