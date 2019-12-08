import { ForcePushMode } from "../../../common/gitApiExtensions";

export interface PushingOutput {
  remote?: string;
  name?: string;
  setUpstream?: boolean;
  forcePushMode?: ForcePushMode;
}