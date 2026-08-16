import { GITHUB_REPO, SOURCE_ZIP_MAIN, SOURCE_ZIP_LATEST, SOURCE_ZIP_BRANCH_NAME } from "./sourceZip";

describe("sourceZip", () => {
  test("points at the public GitHub zip archives", () => {
    expect(GITHUB_REPO).toBe("https://github.com/abhudaya2786/2click-net");
    expect(SOURCE_ZIP_MAIN).toBe(`${GITHUB_REPO}/archive/refs/heads/main.zip`);
    expect(SOURCE_ZIP_LATEST).toBe(
      `${GITHUB_REPO}/archive/refs/heads/${SOURCE_ZIP_BRANCH_NAME}.zip`,
    );
    expect(SOURCE_ZIP_BRANCH_NAME).toMatch(/^cursor\/[a-z0-9-]+-0ba5$/);
  });
});
