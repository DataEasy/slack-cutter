import Spreadsheet from 'edit-google-spreadsheet';
import googleAuth from './google-auth';
import util from './util';

class Sheet {

    requestSpreadsheet(worksheetId, spreadsheetId, callback){
        googleAuth.authenticate(tokens => {
            Spreadsheet.load({
                debug: (process.env.NODE_ENV === 'TEST' ? true : false), 
                spreadsheetId: spreadsheetId,
                worksheetId: worksheetId,
                accessToken: {
                    type: tokens.token_type,
                    token: tokens.access_token
                }
            }, (err, data) => {
                if (err) {
                    console.error('An error occured when requesting the Spreadsheet.');
                    console.error(err);
                }
                data.receive((err, rows, info) => {
                    if (err) {
                        console.error('An error occured when reading the Spreadsheet.');
                        console.error(err);
                    }
                    callback(rows);
                });
            });
        });
    }

}

export default new Sheet();
