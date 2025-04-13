const dotenv = require("dotenv");
import "reflect-metadata";

const result = dotenv.config();

if (result.error) {
  console.log(`Error loading the environment variables,aborting.`);
  process.exit(1);
}

import { logger } from "./config/logger";
import { AppDataSource } from "./config/data-source";

const app = require("./app");

AppDataSource.initialize()
  .then(() => {
    logger.info(`The datasource has been initialized successfully`);
  })
  .catch((err) => {
    logger.error(`Error during datasource initialization.`, err);
    process.exit(1);
  });

const port = process.env.PORT || 5000;

app.listen(port, () => {
  logger.info(`Api is running at http://localhost:${port}`);
});
