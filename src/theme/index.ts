// Design tokens matching the Figma dark theme

export const colors = {
    // Backgrounds
    background: '#121212',
    surface: '#1E1E1E',
    surfaceLight: '#282828',
    surfaceHover: '#333333',

    // Accent
    primary: '#E8A449',
    primaryDark: '#C4872E',
    primaryLight: '#F0C078',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textTertiary: '#727272',

    // States
    error: '#FF5252',
    success: '#4CAF50',

    // Other
    divider: '#2A2A2A',
    overlay: 'rgba(0, 0, 0, 0.6)',
    transparent: 'transparent',
    white: '#FFFFFF',
    black: '#000000',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 999,
};

export const typography = {
    h1: {
        fontSize: 28,
        fontWeight: '700' as const,
        letterSpacing: -0.5,
    },
    h2: {
        fontSize: 22,
        fontWeight: '700' as const,
        letterSpacing: -0.3,
    },
    h3: {
        fontSize: 18,
        fontWeight: '600' as const,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600' as const,
    },
    body: {
        fontSize: 14,
        fontWeight: '400' as const,
    },
    bodyMedium: {
        fontSize: 14,
        fontWeight: '500' as const,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400' as const,
    },
    small: {
        fontSize: 10,
        fontWeight: '400' as const,
    },
};

export const shadows = {
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    elevated: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
};
