import { env, window } from 'vscode';
import * as Constants from '../common/constants';
import { MagitRepository } from '../models/magitRepository';
import { DocumentView } from '../views/general/documentView';
import MagitStatusView from '../views/magitStatusView';
import { CommitDetailView } from '../views/commitDetailView';

export async function copyBufferRevisionCommands(repository: MagitRepository, currentView: DocumentView) {

    let sectionValue: string | undefined;
    if (currentView instanceof MagitStatusView) {
        sectionValue = currentView.HEAD?.commit;
    } else if (currentView instanceof CommitDetailView) {
        sectionValue = currentView.commit.hash;
    }

    if (sectionValue) {
        await env.clipboard.writeText(sectionValue);
        window.setStatusBarMessage(sectionValue, Constants.StatusMessageDisplayTimeout);
    }
}
