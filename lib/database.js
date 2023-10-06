import fs from "fs";
import * as url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export const loadDatabase = async (strategy) => {
  const databaseDirPath = `${__dirname}../database`;
  const databaseFilePath = `${databaseDirPath}/${strategy.name.toLowerCase()}.txt`;

  await ensureDatabase(databaseDirPath, databaseFilePath);

  return fs.readFileSync(databaseFilePath, "utf8");
};

export const writeToDatabase = async (strategy, line) => {
  const databaseFilePath = `${__dirname}../database/${strategy.name.toLowerCase()}.txt`;
  fs.appendFileSync(databaseFilePath, line);
};

const ensureDatabase = async (databaseDirPath, databaseFilePath) => {
  if (!fs.existsSync(databaseDirPath)) {
    fs.mkdirSync(databaseDirPath);
  }
  if (!fs.existsSync(databaseFilePath)) {
    fs.writeFileSync(databaseFilePath, "");
  }
};
