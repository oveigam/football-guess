import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { registerRootComponent } from "expo";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { RootSiblingParent } from "react-native-root-siblings";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TRPCProvider } from "./utils/trpc";

import { GameScreen } from "./screens/game";
import { HomeScreen } from "./screens/home";
import { RootStack } from "./utils/navigation";

const { Screen, Navigator } = createNativeStackNavigator<RootStack>();

const App = () => {
  return (
    <TRPCProvider>
      <RootSiblingParent>
        <SafeAreaProvider>
          <NavigationContainer>
            <Navigator screenOptions={{ headerShown: false }}>
              <Screen name="Home" component={HomeScreen} />
              <Screen name="Game" component={GameScreen} />
            </Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </RootSiblingParent>
      <StatusBar />
    </TRPCProvider>
  );
};

registerRootComponent(App);
