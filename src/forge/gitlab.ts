import { PullRequest } from './model/pullRequest';
import { ForgeState } from './model/forgeState';
import request from './request';
import { Issue } from './model/issue';
import { magitConfig } from '../extension';

export async function getGitlabForgeState(remoteUrl: string): Promise<ForgeState> {

  let fullPath = remoteUrl
    .replace(/.*gitlab.com(\/|:)/, '')
    .replace('.git', '');

  let [pullRequests, issues] = await getPullRequestsAndIssues(magitConfig.gitlabToken!, fullPath);

  return {
    forgeRemote: remoteUrl.toString(),
    pullRequests,
    issues
  };
}

async function getPullRequestsAndIssues(accessToken: string, fullPath: string): Promise<[PullRequest[], Issue[]]> {

  let res = await queryGitlab(accessToken,
    {
      query:
        `query GetOpenPullRequests($fullPath: ID!) {
          project(fullPath: $fullPath) {
            mergeRequests(state: opened, last: 20) {
              edges {
                node {
                  iid
                  title
                  author {
                    username
                  }
                  createdAt
                  description
                  labels(last: 10) {
                    edges {
                      node {
                        title
                        color
                      }
                    }
                  }
                  commits(last: 100) {
                    edges {
                      node {
                        sha
                        message
                        author {
                          name
                          commitEmail
                        }
                        authoredDate
                        committedDate
                      }
                    }
                  }
                }
              }
            }
          }
        }`,
      variables: {
        fullPath
      }
    }
  );

  if (res.errors) {
    throw new Error(res.errors);
  }

  return [

    res.data.project.mergeRequests.edges.map(({ node }: any) => ({
      number: node.iid,
      title: node.title,
      remoteRef: `pull/${node.iid}/head`,
      author: node.author.username,
      createdAt: node.createdAt,
      bodyText: node.description,
      comments: [],
      assignees: [],
      labels: node.labels.edges.map(mapLabel),
      commits: node.commits.edges.map(mapCommit)
    })).reverse(),

    []
  ];
}

const mapLabel = ({ node }: any) => ({
  name: node.title,
  color: node.color
});

const mapCommit = ({ node }: any) => ({
  hash: node.sha,
  message: node.message,
  parents: [],
  authorDate: node.authoredDate,
  authorName: node.author.name,
  authorEmail: node.author.commitEmail,
  commitDate: node.committedDate
});

async function queryGitlab(accessToken: string, ql: object) {
  let res = await request
    .post('https://gitlab.com/api/graphql')
    .set('Authorization', `Bearer ${accessToken}`)
    .set('User-Agent', 'edamagit')
    .send(JSON.stringify(ql));

  return JSON.parse(res.data);
}
