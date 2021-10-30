

export default class Configuration {

    private static backendURL = "https://opencookbook.sterul.com";

    static  getBackendURL(): string {
        return this.backendURL;
    }

    static  setBackendURL(url: string) {
        this.backendURL = url;
    }

    static getApiRoute(): string {
        return "/api/v1";
    }
}