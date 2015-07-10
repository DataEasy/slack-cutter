import moment from 'moment';

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

class CustomFormatter {
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
    }

    defaultFormatter(pr) {
        // PR age:
        const prAge = getPrAge(pr);
        const formattedAge = ' :calendar: ' + prAge + 'd. → ';

        // PR Link:
        const prLink = getPrLink(pr);

        const line = formattedAge + prLink;

        return line;
    }
}

export default new CustomFormatter();
