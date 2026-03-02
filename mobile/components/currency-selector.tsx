import React, { useState, useMemo } from 'react';
import { Modal, StyleSheet, TouchableOpacity, FlatList, View } from 'react-native';
import { ThemedInput } from './themed-input';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Ionicons } from '@expo/vector-icons';
import citiesData from '../data/cities.json';
import { useThemeColor } from '@/hooks/use-theme-color';

type Currency = {
  code: string;
  name?: string;
  symbol?: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function CurrencySelector({ value, onChange, placeholder }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');

  // Extract unique currencies from citiesData
  const uniqueCurrencies = useMemo(() => {
    const currencyMap = new Map<string, Currency>();
    
    citiesData.forEach(city => {
      if (city.currency && !currencyMap.has(city.currency)) {
        currencyMap.set(city.currency, {
          code: city.currency,
          // We can try to infer symbol or name if we had a map, for now just code
        });
      }
    });
    
    return Array.from(currencyMap.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, []);

  const filteredCurrencies = uniqueCurrencies.filter((currency) =>
    currency.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (currency: Currency) => {
    onChange(currency.code);
    setModalVisible(false);
    setSearch('');
  };

  const handleOpen = () => {
    setModalVisible(true);
  };

  return (
    <>
      <ThemedInput
        value={value}
        onChangeText={() => {}}
        placeholder={placeholder || 'Select Currency'}
        onPress={handleOpen}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView style={[styles.modalContainer, { backgroundColor }]}>
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
            <ThemedText type="subtitle">Select Currency</ThemedText>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.searchContainer}>
            <ThemedInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search currency code"
              autoFocus
            />
          </View>

          <FlatList
            data={filteredCurrencies}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelect(item)}
              >
                <View>
                  <ThemedText type="defaultSemiBold">{item.code}</ThemedText>
                </View>
                {value === item.code && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: borderColor }]} />}
            keyboardShouldPersistTaps="handled"
          />
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  separator: {
    height: 1,
    marginLeft: 16,
    opacity: 0.2,
  },
});
