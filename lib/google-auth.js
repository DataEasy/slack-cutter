import google from 'googleapis';
import util from './util';

class GoogleAuth{

    constructor() {
        // FIXME This is ugly. We shouldn't have to change code in order to run tests...
        let configFileName;
        if (process.env.NODE_ENV === 'TEST') {
            configFileName = 'google-service-api-json-key.example.json';
        } else {
            configFileName = 'google-service-api-json-key.json';
        }
        util.readJsonFromFile(configFileName , (err, data) => {
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
