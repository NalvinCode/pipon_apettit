import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  initialText: string;
  onSearch: (inputValue: string) => void;
  onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  initialText,
  onSearch, 
  onClear
}) => {
  const [inputValue, setInputValue] = useState(initialText);
  return (
    <View className="px-4 mb-4">
      <View className="bg-white rounded-xl p-3 shadow-sm flex-row items-center">
        <Ionicons name="search-outline" size={20} color="#B8A898" />
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Buscar recetas, ingredientes..."
          placeholderTextColor="#B8A898"
          className="flex-1 ml-3 text-brown-500 text-base"
          onSubmitEditing={() => onSearch(inputValue)}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          autoComplete="off"
        />
        {inputValue.length > 0 && (
          <TouchableOpacity onPress={onClear} className="ml-2">
            <Ionicons name="close-circle" size={20} color="#B8A898" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => onSearch(inputValue)}
          className="ml-2 bg-primary-400 p-2 rounded-lg"
          disabled={!inputValue.trim()}
        >
          <Ionicons
            name="arrow-forward"
            size={16}
            color={inputValue.trim() ? "white" : "#B8A898"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Asignar displayName para debugging
SearchBar.displayName = 'SearchBar';

export default SearchBar;