import request from 'request';
//TODO remove require and convert to import:
const keys = Object.keys || require('object-keys');
import moment from 'moment';
import querystring from 'querystring';
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

const formatters = {
    docflow(pr) {
        // PR age:
        let prAge = getPrAge(pr);
        prAge = prAge < 10 ? '0' + prAge : prAge;
        const formattedAge = ' :calendar: ' + prAge + 'd.';

        // PR labels:
        const prLabels = getPrLabels(pr);
        const formattedLabels = formatLabels(prLabels);

        // PR type (Bug or Feature):
        const formattedType = formatType(prLabels);

        // PR Link:
        const prLink = getPrLink(pr);

        const line = formattedAge + formattedLabels + ' → ' + formattedType + prLink;

        return line;
    },

    defaultFormatter(pr) {
        // PR age:
        const prAge = getPrAge(pr);
        const formattedAge = ' :calendar: ' + prAge + 'd. → ';

        // PR Link:
        const prLink = getPrLink(pr);

        const line = formattedAge + prLink;

        return line;
    }
};

const getPrLink = pr => `<${ pr.html_url }|${ pr.title }>`;

const getPrLabels = pr => pr.labels.map(label => label.name);

const getPrAge = pr => {
    const today = moment();
    const prDate = moment(pr.created_at);
    return today.diff(prDate, 'days');
};

const formatType = prLabels => {
    let out = '';

    const isBug = prLabels.indexOf('Erro') !== -1;
    const isFeature = prLabels.indexOf('Melhoria') !== -1;

    if (isBug) { out = '*E* '; }
    if (isFeature) { out = '*M* '; }

    return out;
};

const formatLabels = prLabels => {
    const okMark = ':white_check_mark:';
    const notOkMark = ':x:';
    let out = '';

    out += ' Teste Funcional: ';
    const areTestsOk = prLabels.indexOf('Teste Caixa Preta OK') !== -1;
    out += areTestsOk ? okMark : notOkMark;

    out += ' Aprovações: ';

    let prApprovals;
    if (prLabels.indexOf('Aprovação IV+') !== -1) {
        prApprovals = okMark;
    } else if (prLabels.indexOf('Aprovação III') !== -1) {
        prApprovals = '    3';
    } else if (prLabels.indexOf('Aprovação II') !== -1) {
        prApprovals = '    2';
    } else if (prLabels.indexOf('Aprovação I') !== -1) {
        prApprovals = '    1';
    } else {
        prApprovals = notOkMark;
    }
    out += prApprovals;

    return out;
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
                    const prAge = getPrAge(pr);
                    const isOldPr = prAge > DAYS_THRESHOLD;

                    if (criteria === 'all' || criteria === 'old' && isOldPr) {
                        const line = format(pr);
                        results.push(line);
                    }
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
