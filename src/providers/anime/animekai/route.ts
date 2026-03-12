import type { AnimeProviderAdapter } from "../types";
import { AnimeKai } from "./animekai";

export const animekaiProvider: AnimeProviderAdapter = {
  name: "animekai",
  // Unwrap paginated results so generic endpoints receive plain arrays
  search: async (query: string) => (await AnimeKai.search(query)).results,
  latest: async () => (await AnimeKai.latest()).results,
  resolveByExternalId: (params) => AnimeKai.resolveByExternalId(params),
  // Adapt AnimeKaiInfo → ProviderAnimeInfo (add 'name' alias + null mappings)
  info: async (nativeId: string) => {
    const data = await AnimeKai.info(nativeId);
    if (!data) return null;
    return {
      ...data,
      name: data.title,
      mappings: null,
    };
  },
  getEpisodeSession: (nativeId: string, episodeNumber: number) =>
    AnimeKai.getEpisodeSession(nativeId, episodeNumber),
  streams: (nativeId: string, episodeSession: string) =>
    AnimeKai.streams(nativeId, episodeSession),
  getMappingsAndName: (nativeId: string) =>
    AnimeKai.getMappingsAndName(nativeId),
};
