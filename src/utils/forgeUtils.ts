import { PullRequest } from '../models/pullRequest';
import { Octokit } from '@octokit/rest';
import { URL } from 'url';
import * as vscode from 'vscode';

const GITHUB_AUTH_PROVIDER_ID = 'github';
const SCOPES = ['repos'];

export interface Forge {
  getPullRequests(): Promise<PullRequest[]>;
}

class Github implements Forge {
  constructor(
    public owner: string,
    public repo: string,
    public octokit: Octokit) { }

  async getPullRequests(): Promise<PullRequest[]> {
    try {
      let prs = await this.octokit.pulls.list({
        owner: this.owner,
        repo: this.repo.replace('.git', '')
      });

      return prs.data.map(v => ({
        id: v.number,
        name: v.title,
        labels: v.labels.map(v => ({
          name: v.name,
          color: v.color,
        })),
        remoteRef: `pull/${v.number}/head`,
      }));
    } catch (err) {
      // Catch errors like 404, return an empty list instead.
      console.error(err);
      return [];
    }
  }
}

export async function findForge(url: URL): Promise<Forge | null> {
  if (url.hostname === 'github.com') {
    const session = await vscode.authentication.getSession(GITHUB_AUTH_PROVIDER_ID, SCOPES, { createIfNone: false });

    if (session) {
      const octokit = new Octokit({
        userAgent: 'edamagit-forge',
        auth: session.accessToken
      });
      const owner = url.pathname.split('/').filter(Boolean)[0];
      const repo = url.pathname.split('/').filter(Boolean)[1];
      return new Github(owner, repo, octokit);
    }
  }
  return null;
}