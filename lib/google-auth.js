import google from 'googleapis';
import util from './util';

class GoogleAuth{

    authenticate(callback) {
        if (this.jwtClient) {
            this.jwtClient.authorize((err, tokens) => {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(tokens);
            });
        } else {
            // FIXME This is ugly. We shouldn't have to change code in order to run tests...
            let configFileName;
            if (process.env.NODE_ENV === 'TEST') {
                configFileName = 'google-service-api-json-key.example.json';
            } else {
                configFileName = 'google-service-api-json-key.json';
            }
            util.readJsonFromFile(configFileName , (err, data) => {
                if (err) {
                    console.error('An error occured when loading the Google Api Key File.');
                    console.error(err);
                    return;
                }
                this.jwtClient = new google.auth.JWT(
                    data.client_email,
                    null,
                    data.private_key,
                    ['https://www.googleapis.com/auth/drive.metadata.readonly', 'https://spreadsheets.google.com/feeds'],
                    null);
                this.authenticate(callback);
            });
        }
    }
}

export default new GoogleAuth();