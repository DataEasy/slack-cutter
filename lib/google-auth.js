import google from 'googleapis';
import util from './util';

class GoogleAuth{

    constructor() {
        util.readJsonFromFile('google-service-api-json-key.json', (err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            this.jwtClient = new google.auth.JWT(
                data.client_email,
                null,
                data.private_key,
                ['https://www.googleapis.com/auth/drive.metadata.readonly', 'https://spreadsheets.google.com/feeds'],
                null);
        });

        return this;
    }

    authenticate(callback){
        this.jwtClient.authorize((err, tokens) => {
            if (err) {
                console.log(err);
                return;
            }
            callback(tokens);
        });
    }
}

export default new GoogleAuth();
