const { runAnimePaheTests } = require("./animepahe");
const { runMangaballTests } = require("./mangaball");

describe("Provider Integration Tests (Jest)", () => {
    it("should run AnimePahe tests successfully", async () => {
        await runAnimePaheTests();
    }, 30000);

    it("should run Mangaball tests successfully", async () => {
        await runMangaballTests();
    }, 30000);
});
