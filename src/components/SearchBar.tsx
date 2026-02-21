import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onClear: () => void;
    placeholder?: string;
    autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChangeText,
    onClear,
    placeholder = 'Search songs, artists, albums...',
    autoFocus = false,
}) => {
    return (
        <View style={styles.container}>
            <Ionicons
                name="search"
                size={18}
                color={colors.textTertiary}
                style={styles.searchIcon}
            />
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textTertiary}
                autoFocus={autoFocus}
                selectionColor={colors.primary}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={onClear} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        height: 44,
        marginHorizontal: spacing.lg,
    },
    searchIcon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        ...typography.body,
        color: colors.textPrimary,
        padding: 0,
        height: '100%',
    },
    clearButton: {
        padding: spacing.xs,
        marginLeft: spacing.xs,
    },
});
