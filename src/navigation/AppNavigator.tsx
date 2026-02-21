import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { QueueScreen } from '../screens/QueueScreen';
import { MiniPlayer } from '../components/MiniPlayer';
import { usePlayerStore } from '../stores/usePlayerStore';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab navigator with MiniPlayer overlay
const TabNavigator: React.FC = () => {
    const currentTrack = usePlayerStore(s => s.currentTrack);

    return (
        <View style={styles.tabContainer}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName: keyof typeof Ionicons.glyphMap = 'home';

                        if (route.name === 'Home') {
                            iconName = focused ? 'home' : 'home-outline';
                        } else if (route.name === 'Search') {
                            iconName = focused ? 'search' : 'search-outline';
                        } else if (route.name === 'Library') {
                            iconName = focused ? 'library' : 'library-outline';
                        } else if (route.name === 'Profile') {
                            iconName = focused ? 'person' : 'person-outline';
                        }

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: colors.textTertiary,
                    tabBarStyle: styles.tabBar,
                    tabBarLabelStyle: styles.tabBarLabel,
                })}
            >
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Search" component={SearchScreen} />
                <Tab.Screen name="Library" component={QueueScreen} />
                <Tab.Screen
                    name="Profile"
                    component={HomeScreen}
                    options={{ tabBarLabel: 'Profile' }}
                />
            </Tab.Navigator>

            {/* Mini Player overlay above tabs */}
            {currentTrack && (
                <View style={styles.miniPlayerContainer}>
                    <MiniPlayerWrapper />
                </View>
            )}
        </View>
    );
};

// Wrapper to access navigation in MiniPlayer
const MiniPlayerWrapper: React.FC = () => {
    const navigation = require('@react-navigation/native').useNavigation() as any;

    return (
        <MiniPlayer onPress={() => navigation.navigate('Player')} />
    );
};

export const AppNavigator: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: colors.background },
                }}
            >
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen
                    name="Player"
                    component={PlayerScreen}
                    options={{
                        presentation: 'modal',
                        gestureEnabled: true,
                        gestureDirection: 'vertical',
                    }}
                />
                <Stack.Screen
                    name="Queue"
                    component={QueueScreen}
                    options={{
                        presentation: 'modal',
                        gestureEnabled: true,
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    tabContainer: {
        flex: 1,
        position: 'relative',
    },
    tabBar: {
        backgroundColor: colors.surface,
        borderTopColor: colors.divider,
        borderTopWidth: 0.5,
        height: 60,
        paddingBottom: 6,
        paddingTop: 6,
        elevation: 0,
    },
    tabBarLabel: {
        fontSize: 10,
        fontWeight: '500',
    },
    miniPlayerContainer: {
        position: 'absolute',
        bottom: 60, // Above the tab bar
        left: 0,
        right: 0,
        zIndex: 100,
    },
});
