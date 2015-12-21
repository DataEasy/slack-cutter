import google from 'googleapis';
import util from './util';

const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly', 'https://spreadsheets.google.com/feeds'];
class GoogleAuth {

    authenticate(callback) {
        if (this.jwtClient) {
            this.jwtClient.authorize((err, tokens) => {
                if (err) {
                    console.error('An error occured when authenticating to Google API.');
                    console.error(err);
                    return;
                }
                callback(tokens);
            });
        } else {
            let apiKeyFileName;
            if (process.env.NODE_ENV === 'TEST') {// FIXME This is ugly. We shouldn't have to change code in order to run tests...
                apiKeyFileName = 'google-service-api-json-key.example.json';
            } else {
                apiKeyFileName = 'google-service-api-json-key.json';
            }
            util.readJsonFromFile(apiKeyFileName , (err, data) => {
                if (err) {
                    console.error('An error occured when loading the Google Api Key File.');
                    console.error(err);
                    return;
                }
                this.jwtClient = new google.auth.JWT(
                    data.client_email,
                    null,
                    data.private_key,
                    SCOPES,
                    null);
                this.authenticate(callback);
            });
        }
    }
}

export default new GoogleAuth();
