import React, { useMemo } from 'react';
import { Text, Pressable, View, StyleSheet } from 'react-native';

const DOMAINS = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com', '@icloud.com'];

interface DomainSuggestionsProps {
  /** Valor actual del campo email — se usa para filtrar/ocultar sugerencias */
  email?: string;
  onSelect: (domain: string) => void;
}

export const DomainSuggestions: React.FC<DomainSuggestionsProps> = ({ email = '', onSelect }) => {
  const filteredDomains = useMemo(() => {
    // Sin '@' aún → mostrar todos
    if (!email.includes('@')) return DOMAINS;

    const afterAt = email.split('@')[1] || '';
    const typed = '@' + afterAt.toLowerCase();

    // Si ya coincide exactamente con un dominio completo → ocultar
    if (DOMAINS.includes(typed)) return [];

    // Mostrar solo los que coinciden con lo que va escrito
    return DOMAINS.filter((d) => d.startsWith(typed) && d !== typed);
  }, [email]);

  console.log('🏷️ DomainSuggestions:', { email, filteredDomains });

  if (filteredDomains.length === 0) return null;

  return (
    <View style={styles.container}>
      {filteredDomains.map((domain) => (
        <Pressable
          key={domain}
          onPress={() => {
            console.log('💥 Chip pressed:', domain);
            onSelect(domain);
          }}
          onPressIn={() => console.log('👆 Chip press IN:', domain)}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          style={({ pressed }) => [
            styles.chip,
            pressed && styles.chipPressed,
          ]}
        >
          <Text style={styles.chipText}>{domain}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipPressed: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  chipText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
});
