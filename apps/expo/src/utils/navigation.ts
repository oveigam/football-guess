import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStack = {
  Home: undefined;
  Game: { code: string; myId: number };
};

export type ScreenProps<T extends keyof RootStack> = NativeStackScreenProps<RootStack, T>;
