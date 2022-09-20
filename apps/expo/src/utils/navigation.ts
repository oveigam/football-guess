import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStack = {
  Home: undefined;
  Game: { gameId: number; myId: number };
};

export type ScreenProps<T extends keyof RootStack> = NativeStackScreenProps<RootStack, T>;
