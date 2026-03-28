export const MOCK_DATA = {
    anime: {
        animepahe: {
            search: [{ id: "test-id", title: "Test Anime", type: "TV", episodes: 12, status: "Completed", year: 2024, score: 9.0, poster: "https://example.com/poster.jpg", session: "test-session" }],
            latest: [{ id: "test-id", title: "Test Anime", episode: 1, snapshot: "https://example.com/snapshot.jpg", session: "test-session", fansub: "Pahe", created_at: "2024-03-29 12:00:00" }],
            info: { id: "test-id", name: "Test Anime", description: "Awesome test anime synopsis.", poster: "https://example.com/poster.jpg", background: "https://example.com/bg.jpg", aired: "Jan 1, 2024", duration: "24m", genres: ["Action"], externalLinks: ["https://myanimelist.net/anime/1"] },
            episodes: [{ title: "Episode 1", episode: 1, released: "2024-03-29T12:00:00Z", snapshot: "https://example.com/snapshot.jpg", duration: "24:00", filler: false, session: "test-session" }],
            stream: { id: "test-id--1080--jpn", title: "jpn / 1080p", url: "https://example.com/stream", directUrl: "https://example.com/direct.m3u8", quality: "1080", audio: "jpn", downloadUrl: "https://example.com/download.mp4", corsHeaders: { "Referer": "https://kwik.cx/" } }
        },
        animekai: {
            search: { results: [{ id: "test-id", title: "Test Anime Kai", poster: "https://example.com/poster.jpg", type: "TV", duration: "24m", rating: "8.5" }], totalPages: 1 },
            spotlight: [{ id: "test-id", title: "Spotlight Anime", poster: "https://example.com/poster.jpg", description: "Spotlighted anime", jname: "Test", rank: 1, otherInfo: ["TV", "24m"] }],
            info: { id: "test-id", title: "Test Anime Kai", jpName: "Test", description: "Synopsis", poster: "https://example.com/poster.jpg", type: "TV", status: "Ongoing", genres: ["Genre"], aired: "2024", duration: "24m", episodes: [] },
            watch: { sources: [{ url: "https://example.com/source.m3u8", isM3U8: true, quality: "auto" }], subtitles: [] },
            servers: [{ id: "server-1", name: "Server 1" }]
        },
        toonstream: {
            home: { featured: [], recent: [] },
            search: { results: [], totalPages: 1 },
            info: { id: "test-slug", title: "Test Toon", description: "Synopsis", episodes: [] },
            sources: { sources: [], subtitles: [] }
        },
        animesalt: {
            home: { lastEpisodes: [] },
            search: { data: [] },
            info: { title: "Test Salt", poster: "", description: "", downloadLinks: [], embeds: [], sources: [] },
            sources: { sources: [], subtitles: [] }
        }
    },
    manga: {
        mangaball: {
            home: { banner: [], featured: [] },
            latest: { results: [{ id: "manga-id", title: "Test Manga", poster: "https://example.com/poster.jpg", chapter: "1" }] },
            detail: { id: "manga-id", title: "Test Manga", description: "Synopsis", genres: ["Action"], status: "Ongoing", chapters: [{ id: "chap-1", title: "Chapter 1", released: "2024", volume: "1" }] },
            read: { images: ["https://example.com/p1.jpg", "https://example.com/p2.jpg"] }
        },
        allmanga: {
            home: { sections: [] },
            search: { results: [], totalPages: 0 },
            detail: { id: "allmanga-id", title: "AllManga Test", chapters: [] },
            read: { images: [] }
        },
        atsu: {
            home: { trending: { title: "Trending", items: [] } },
            filters: { genres: [], types: [], statuses: [] },
            detail: { id: "atsu-id", title: "Atsu Test", chapters: [] },
            read: { pages: [] }
        }
    },
    movieTv: {
        primesrc: {
            sources: { sources: [{ url: "https://example.com/stream.m3u8", quality: "auto", isM3U8: true }], subtitles: [] }
        },
        yflix: {
            home: { trending: [], latest: [] },
            search: { results: [] }
        },
        himovies: {
            home: { trending: [], latestMovies: [], latestTv: [] },
            search: { results: [{ id: "movie-1", title: "Test Movie", type: "movie", poster: "https://example.com/poster.jpg" }] },
            info: { id: "movie-1", title: "Test Movie", description: "Synopsis", cast: [], genres: [], episodes: [] },
            sources: { sources: [], subtitles: [] }
        },
        flixhq: {
            home: { trending: [], latestMovies: [], latestTv: [] },
            search: { results: [] },
            info: { id: "flix-1", title: "Flix Test", episodes: [] },
            sources: { sources: [], subtitles: [] }
        }
    },
    music: {
        tidal: {
            search: { tracks: [] },
            track: { id: "tidal-1", title: "Tidal Track" },
            featured: []
        }
    },
    stream: {
        vidcore: {
            provider: "Vidcore",
            status: "operational",
            description: "Vidcore is a streaming provider that supplies encrypted video sources and multi-language subtitles.",
            message: "Vidcore provider is running. Visit /docs for available endpoints."
        },
        vidfast: {
            provider: "vidfast",
            status: "active",
            type: "stream",
            capabilities: ["movie", "tv"]
        }
    }
}
