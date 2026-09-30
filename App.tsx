import React, { useState } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { LightColors, DarkColors } from './src/theme/colors';

function App(): React.JSX.Element {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(systemColorScheme === 'dark');

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const colors = isDarkMode ? DarkColors : LightColors;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator
          colors={colors}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
