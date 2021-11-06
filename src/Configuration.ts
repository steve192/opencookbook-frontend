import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export default class Configuration {
    private static backendURL = "https://opencookbook.sterul.com";
    private static authToken = "";


    static async setAuthToken(token: string) {
        if (Platform.OS == 'web') {
            this.authToken = token;
            return;
        }
        await SecureStore.setItemAsync("authToken", token);
    }

    static async getAuthToken(): Promise<string | null> {
        if (Platform.OS == 'web') {
            return this.authToken;
        }
        const token = await SecureStore.getItemAsync("authToken");
        return token;
    }


    static getBackendURL(): string {
        return this.backendURL;
    }

    static setBackendURL(url: string) {
        this.backendURL = url;
    }

    static getApiRoute(): string {
        return "/api/v1";
    }
}