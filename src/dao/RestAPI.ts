import axios from "axios";


class RestAPI {

    private static serverUrl = "http://localhost:8080";
    
    static async authenticate(emailAddress: string, password: string): Promise<void> {
        let response = await axios.post(this.url("/login"), {
            emailAddress: emailAddress,
            password: password
        });
        response.headers["Authentification"]

    }

    private static url(path: string): string {
        return RestAPI.serverUrl + path;
    }
}

export default RestAPI;