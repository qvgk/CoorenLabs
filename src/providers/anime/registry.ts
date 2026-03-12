import { animepaheProvider } from "./animepahe/route";
import { animekaiProvider } from "./animekai/route";

export const animeProviderRegistry = {
  animepahe: animepaheProvider,
  animekai: animekaiProvider,
} as const;

export type AnimeProviderName = keyof typeof animeProviderRegistry;

export const SUPPORTED_ANIME_PROVIDERS = Object.keys(
  animeProviderRegistry,
) as AnimeProviderName[];

export function isValidAnimeProvider(name: string): name is AnimeProviderName {
  return name in animeProviderRegistry;
}

export function getAnimeProvider(name: AnimeProviderName) {
  return animeProviderRegistry[name];
}
