import google from 'googleapis';
import util from './util';

let KEY;
util.readJsonFromFile('./google-service-api-json-key.json', data => {
    KEY = data;
});

class GoogleAuth{
    constructor() {
        return this;
    }

    authenticate(callback){
        let jwtClient = new google.auth.JWT(
            KEY.client_email,
            null,
            KEY.private_key,
            ['https://www.googleapis.com/auth/drive.metadata.readonly', 'https://spreadsheets.google.com/feeds'],
            null);
        let drive = google.drive('v2');

        jwtClient.authorize((err, tokens) => {
            if (err) {
                console.log(err);
                return;
            }
            callback(tokens);
        });
    }
}

export default new GoogleAuth();
