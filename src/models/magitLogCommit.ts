import { Commit } from '../typings/git';

interface IMagitLogCommit {
  graph: string[] | undefined;
  hash: string;
  refs: string | undefined;
  author: string;
  time: Date;
  message: string;
}

export class MagitLogCommit implements Commit, IMagitLogCommit {
  graph: string[] | undefined;
  hash: string;
  refs: string | undefined;
  author: string;
  time: Date;
  message: string;

  constructor(commit: IMagitLogCommit) {
    this.graph = commit.graph;
    this.hash = commit.hash;
    this.refs = commit.refs;
    this.author = commit.author;
    this.time = commit.time;
    this.message = commit.message;
  }

  get parents(): string[] {
    throw Error('Not Implemented for LogCommit');
  }
  get authorEmail(): string | undefined {
    throw Error('Not Implemented for LogCommit');
  }
}