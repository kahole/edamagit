import { MagitRepository } from '../models/magitRepository';
import { gitRun } from './gitRawRunner';
import { IExecutionResult } from '../common/gitApiExtensions';

export default class GitUtils {

  public static setConfigVariable(repository: MagitRepository, key: string, val: string): Promise<IExecutionResult<string>> {
    let args = ['config', '--local', key, val];
    return gitRun(repository, args);
  }
}