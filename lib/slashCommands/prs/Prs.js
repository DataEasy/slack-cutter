import request from 'request';
import querystring from 'querystring';
import formatters from './CustomFormatter';
import config from '../../config';

const DAYS_THRESHOLD = 5;

const toString = (results, repoName) => {
    const prsNum = results.length;
    const repoUrl = `https://github.com/DataEasy/${ repoName }/pulls`;
    const repoLink = `<${ repoUrl }|${ repoName }>`;

    if (prsNum === 0) {
        return `_[Nenhum PR aberto para ${ repoLink }. Vai trabaiá, rapaz! :sweat_smile:]_`;
    }

    const header = prsNum === 1 ? `1 PR aberto em ${ repoLink }:` : `${ prsNum } PRs abertos em ${ repoLink }:`;
    const body = results.join('\n');

    return `${ header }\n\n${ body }`;
};

export default httpResponse => {
    return {
        listPrs(repository, criteria = 'all', callback) {
            if (arguments.length <= 1) {
                throw new Error('At least one argument must be passed');
            }
            const queryParams = {
                state: 'open',
                sort: 'created',
                direction: 'asc'
            };

            const options = {
                url: `https://api.github.com/repos/dataeasy/${ repository }/issues?${ querystring.stringify(queryParams) }`,
                headers: { 'User-Agent': 'dataeasy' },
                auth: {
                    user: config.githubUser,
                    pass: config.githubToken
                }
            };

            httpResponse.send('Contactando GitHub. Os PRs serão listados no canal devido em breve. Aguarde. Sorria. :blush:');

            request(options, (err, response, body) => {
                if (err) { return callback(err); }

                let prs;
                try {
                    prs = JSON.parse(body);
                } catch (error) {
                    console.log('Error parsing JSON', error);
                    return callback(error);
                }

                const format = formatters[repository] || formatters.defaultFormatter;
                const results = [];

                // Any PR is an issue. But not all issues are PRs,
                // so let's filter issues that aren't PRs out:
                prs.filter(pr => pr.pull_request).forEach(pr => {
                    results.push(format(pr));
                });

                let channel;
                try {
                    let jsonFile = './repoChannelMapping.json';
                    // FIXME This is ugly.
                    // We shouldn't have to change code in order to run tests...
                    if (process.env.NODE_ENV === 'TEST') {
                        jsonFile = jsonFile.replace('.json', '.example.json');
                    }
                    channel = require(jsonFile)[repository];
                } catch (err) {
                    console.log('No slack channel mapping found for:', repository);
                }

                return callback(null, toString(results, repository), channel);
            });
        }
    };
};
