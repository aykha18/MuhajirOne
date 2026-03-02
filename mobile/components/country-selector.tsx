import React, { useState, useMemo } from 'react';
import { Modal, StyleSheet, TouchableOpacity, FlatList, View } from 'react-native';
import { ThemedInput } from './themed-input';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Ionicons } from '@expo/vector-icons';
import citiesData from '../data/cities.json';
import { useThemeColor } from '@/hooks/use-theme-color';

type Country = {
  name: string;
  code: string; // ISO code e.g. AE
  dialCode: string; // e.g. +971
};

type Props = {
  value: Country;
  onChange: (country: Country) => void;
};

export function CountrySelector({ value, onChange }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');

  // Extract unique countries from citiesData
  const uniqueCountries = useMemo(() => {
    const countryMap = new Map<string, Country>();
    
    citiesData.forEach((city: any) => {
      // Ensure we have necessary fields (some old entries might miss them if script failed or partial data)
      // But we just updated all of them.
      if (city.country && city.countryCode && city.dialCode && !countryMap.has(city.countryCode)) {
        countryMap.set(city.countryCode, {
          name: city.country,
          code: city.countryCode,
          dialCode: city.dialCode
        });
      }
    });
    
    return Array.from(countryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredCountries = uniqueCountries.filter((country) =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.code.toLowerCase().includes(search.toLowerCase()) ||
    country.dialCode.includes(search)
  );

  const handleSelect = (country: Country) => {
    onChange(country);
    setModalVisible(false);
    setSearch('');
  };

  const handleOpen = () => {
    setModalVisible(true);
  };

  return (
    <>
      <ThemedInput
        value={`${value.name} (${value.dialCode})`}
        onChangeText={() => {}}
        placeholder="Select Country"
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
            <ThemedText type="subtitle">Select Country</ThemedText>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.searchContainer}>
            <ThemedInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search country or code"
              autoFocus
            />
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelect(item)}
              >
                <View>
                  <ThemedText type="defaultSemiBold">{item.name} ({item.code})</ThemedText>
                  <ThemedText style={{ color: '#666' }}>{item.dialCode}</ThemedText>
                </View>
                {value.code === item.code && (
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
