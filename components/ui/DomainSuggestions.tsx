import React, { useMemo } from 'react';
import { Text, Pressable, View, StyleSheet, Platform } from 'react-native';

const DOMAINS = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com', '@icloud.com'];

interface DomainSuggestionsProps {
  /** Valor actual del campo email — se usa para filtrar/ocultar sugerencias */
  email?: string;
  onSelect: (domain: string) => void;
}

export const DomainSuggestions: React.FC<DomainSuggestionsProps> = ({ email = '', onSelect }) => {
  const filteredDomains = useMemo(() => {
    if (!email.includes('@')) return DOMAINS;

    const afterAt = email.split('@')[1] || '';
    const typed = '@' + afterAt.toLowerCase();

    if (DOMAINS.includes(typed)) return [];

    return DOMAINS.filter((d) => d.startsWith(typed) && d !== typed);
  }, [email]);

  if (filteredDomains.length === 0) return null;

  return (
    <View style={styles.container}>
      {filteredDomains.map((domain) => (
        <Pressable
          key={domain}
          onPress={() => onSelect(domain)}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          style={({ pressed }) => [
            styles.chip,
            pressed && styles.chipPressed,
            Platform.OS === 'web' && (styles.chipWeb as any),
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
  chipWeb: {
    // @ts-ignore - web only
    cursor: 'pointer',
    userSelect: 'none',
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
