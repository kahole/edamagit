import { MagitRepository } from '../models/magitRepository';
import { IExecutionResult } from './commandRunner/command';
import { gitRun } from './gitRawRunner';

export default class GitUtils {

  public static setConfigVariable(repository: MagitRepository, key: string, val: string): Promise<IExecutionResult<string>> {
    let args = ['config', '--local', key, val];
    return gitRun(repository.gitRepository, args);
  }
}