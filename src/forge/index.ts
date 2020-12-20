import { MagitRemote } from '../models/magitRemote';
import { ForgeState } from './model/forgeState';
import { getGithubForgeState } from './github';
import { magitConfig } from '../extension';

const REFRESH_INTERVAL_DURATION_MS = 2 * 60 * 1000;
const INACTIVITY_TRESHOLD_DURATION_MS = 25 * 60 * 1000;

type GetForgeState = (remoteUrl: string) => Promise<ForgeState>;

const cached = new Map<string, { state: ForgeState, updatedAt: number, refresh: GetForgeState, lastAccessed: number }>();

export let forgeRefreshInterval: NodeJS.Timeout | undefined;

function setSelfHydratingCacheEntry(remoteUrl: string, state: ForgeState, factory: GetForgeState) {

  cached.set(remoteUrl, {
    state,
    updatedAt: Date.now(),
    refresh: factory,
    lastAccessed: Date.now()
  });

  if (!forgeRefreshInterval) {

    forgeRefreshInterval = setInterval(() => {

      if (cached.entries.length === 0 && forgeRefreshInterval) {
        clearInterval(forgeRefreshInterval);
        forgeRefreshInterval = undefined;
      }

      cached.forEach(async (entry, remoteUrl) => {

        if (entry.lastAccessed < Date.now() - INACTIVITY_TRESHOLD_DURATION_MS) {
          cached.delete(remoteUrl);
          return;
        }

        cached.set(remoteUrl, {
          state: await entry.refresh(remoteUrl),
          updatedAt: Date.now(),
          refresh: entry.refresh,
          lastAccessed: entry.lastAccessed
        });

      });

    }, REFRESH_INTERVAL_DURATION_MS);
  }
}

function getCached(remoteUrl: string) {

  let cacheEntry = cached.get(remoteUrl);

  if (cacheEntry) {
    if (cacheEntry.updatedAt ?? 0 > Date.now() - REFRESH_INTERVAL_DURATION_MS) {

      cached.set(remoteUrl, { ...cacheEntry, lastAccessed: Date.now() });

      return cacheEntry?.state;
    } else {
      cached.delete(remoteUrl);
    }
  }

  return undefined;
}

export async function forgeStatus(remotes: MagitRemote[]): Promise<ForgeState | undefined> {

  if (magitConfig.forgeEnabled !== true) {
    return undefined;
  }

  // Check remotes, in order: upstream, origin.
  let forgeRemote = remotes.find(v => v.name === 'upstream') ?? remotes.find(v => v.name === 'origin');
  if (forgeRemote?.fetchUrl !== undefined) {

    let cachedState = getCached(forgeRemote.fetchUrl);

    if (cachedState) {
      return cachedState;
    }

    let getForgeState = selectForgeType(forgeRemote.fetchUrl);

    if (getForgeState) {

      try {
        let forgeState = await getForgeState(forgeRemote.fetchUrl);

        setSelfHydratingCacheEntry(forgeRemote.fetchUrl, forgeState, getForgeState);

        return forgeState;

      } catch (error) {

        // TODO: procsess-Log / display error
        console.error(error);
        return undefined;
      }
    }
  }
}

function selectForgeType(remoteUrl: string): GetForgeState | undefined {

  if (remoteUrl.includes('github.com')) {

    return getGithubForgeState;
  }

  return;
}