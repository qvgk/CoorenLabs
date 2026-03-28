import { describe, it, expect, vi } from "vitest"; // Vitest-specific but Jest has compatible globals
import { runAnimePaheTests } from "./animepahe";
import { runMangaballTests } from "./mangaball";

// If running in Jest, these globals are provided automatically.
// If running in Vitest, they are imported above.
// However, to keep it cross-compatible without manual imports in كل file:
// We use common test syntax.

describe("Provider Integration Tests", () => {
    it("should run AnimePahe tests successfully", async () => {
        // We expect runAnimePaheTests NOT to throw
        await expect(runAnimePaheTests()).resolves.not.toThrow();
    }, 30000); // 30s timeout for network requests

    it("should run Mangaball tests successfully", async () => {
        await expect(runMangaballTests()).resolves.not.toThrow();
    }, 30000);
});
