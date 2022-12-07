import { MagitRemote } from '../models/magitRemote';
import { ForgeState } from './model/forgeState';
import { getGithubForgeState } from './github';
import { magitConfig } from '../extension';
import { MagitRepository } from '../models/magitRepository';
import MagitUtils from '../utils/magitUtils';

const REFRESH_INTERVAL_DURATION_MS = 2 * 60 * 1000;
const INACTIVITY_TRESHOLD_DURATION_MS = 25 * 60 * 1000;

type GetForgeState = (remoteUrl: string) => Promise<ForgeState>;

const cached = new Map<string, { state: ForgeState, updatedAt: number, refresh: GetForgeState, lastAccessed: number }>();

export let forgeRefreshInterval: NodeJS.Timeout | undefined;

function setAutoUpdatingCacheEntry(remoteUrl: string, state: ForgeState, factory: GetForgeState) {

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

export function forgeStatusCached(remotes: MagitRemote[]): ForgeState | undefined {

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
  }
}

export async function scheduleForgeStatusAsync(repository: MagitRepository): Promise<void> {

  if (magitConfig.forgeEnabled !== true) {
    return undefined;
  }

  let forgeRemote = repository.remotes.find(v => v.name === 'upstream') ?? repository.remotes.find(v => v.name === 'origin');
  if (forgeRemote?.fetchUrl !== undefined) {

    let cachedState = getCached(forgeRemote.fetchUrl);

    if (!cachedState) {
      let getForgeState = selectForgeType(forgeRemote.fetchUrl);

      if (getForgeState) {

        try {
          const forgeState = await getForgeState(forgeRemote.fetchUrl);
          setAutoUpdatingCacheEntry(forgeRemote.fetchUrl, forgeState, getForgeState);
          // Trigger update
          MagitUtils.magitStatusAndUpdate(repository);

        } catch (error) {
          // TODO: procsess-Log / display error
          console.error(error);
        }
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