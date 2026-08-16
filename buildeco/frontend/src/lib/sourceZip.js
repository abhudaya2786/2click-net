/** Public GitHub archive URLs for the 2click-net monorepo (BuildEco + 2Click). */
export const GITHUB_REPO = "https://github.com/abhudaya2786/2click-net";

export const SOURCE_ZIP_MAIN = `${GITHUB_REPO}/archive/refs/heads/main.zip`;

/** Branch that adds this download page; after merge, main.zip is enough. */
export const SOURCE_ZIP_BRANCH_NAME = "cursor/source-zip-download-0ba5";

export const SOURCE_ZIP_LATEST = `${GITHUB_REPO}/archive/refs/heads/${SOURCE_ZIP_BRANCH_NAME}.zip`;
