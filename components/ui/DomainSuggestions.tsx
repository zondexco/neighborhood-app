import React from 'react';
import { Text, TouchableOpacity, ScrollView } from 'react-native';

interface DomainSuggestionsProps {
  onSelect: (domain: string) => void;
}

export const DomainSuggestions: React.FC<DomainSuggestionsProps> = ({ onSelect }) => {
  const domains = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com', '@icloud.com'];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      keyboardShouldPersistTaps="always"
      contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
      className="mt-3 max-h-12"
    >
      {domains.map((domain) => (
        <TouchableOpacity
          key={domain}
          onPress={() => onSelect(domain)}
          className="bg-white/10 px-4 py-2 rounded-full border border-white/10 active:bg-white/20"
        >
          <Text className="text-white/80 text-sm font-medium">{domain}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};
