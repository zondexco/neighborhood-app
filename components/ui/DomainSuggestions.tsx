import React, { useMemo } from 'react';
import { Text, Pressable, ScrollView, Platform } from 'react-native';

const DOMAINS = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com', '@icloud.com'];

interface DomainSuggestionsProps {
  /** Valor actual del email para filtrar/ocultar sugerencias */
  email?: string;
  onSelect: (domain: string) => void;
}

export const DomainSuggestions: React.FC<DomainSuggestionsProps> = ({ email = '', onSelect }) => {
  const filteredDomains = useMemo(() => {
    if (!email.includes('@')) return DOMAINS;

    const typed = '@' + email.split('@')[1];
    // Si ya tiene un dominio completo válido, ocultar sugerencias
    if (DOMAINS.includes(typed.toLowerCase())) return [];
    // Filtrar por lo que el usuario lleva escrito después del @
    return DOMAINS.filter((d) => d.startsWith(typed.toLowerCase()) && d !== typed.toLowerCase());
  }, [email]);

  if (filteredDomains.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="always"
      contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
      style={{ marginTop: 12, maxHeight: 48 }}
    >
      {filteredDomains.map((domain) => (
        <Pressable
          key={domain}
          onPress={() => onSelect(domain)}
          style={({ pressed }) => ({
            backgroundColor: pressed ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
          })}
          // hitSlop agranda el área táctil para mejorar usabilidad en móviles
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' }}>
            {domain}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
};
