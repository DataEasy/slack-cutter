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

    out += ' Testes: ';
    const areTestsOk = prLabels.indexOf('Teste Caixa Preta OK') !== -1;
    out += areTestsOk ? okMark : notOkMark;

    out += ' Aprovações: ';

    let prApprovals;
    if (prLabels.indexOf('Aprovação IV+') !== -1) {
        prApprovals = okMark;
    } else if (prLabels.indexOf('Aprovação III') !== -1) {
        prApprovals = ':three:';
    } else if (prLabels.indexOf('Aprovação II') !== -1) {
        prApprovals = ':two:';
    } else if (prLabels.indexOf('Aprovação I') !== -1) {
        prApprovals = ':one:';
    } else {
        prApprovals = notOkMark;
    }
    out += prApprovals;

	out += ' Pendências: ';

	let prPendencies = '';
	if (prLabels.indexOf('Task(s)') !== -1) {
		prPendencies += ':git_task:';
	}
	if (prLabels.indexOf('Dúvida') !== -1) {
		prPendencies += ':git_doubt:';
	}
	if (prLabels.indexOf('Rebase') !== -1) {
		prPendencies += ':git_rebase:';
	}
	if (prLabels.indexOf('WIP') !== -1) {
		prPendencies += ':git_wip:';
	}
	if (!prPendencies) {
		prPendencies += okMark;
	}
	out += prPendencies;

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
