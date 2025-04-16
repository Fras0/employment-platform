const dotenv = require("dotenv");

const result = dotenv.config();

import { AppDataSource } from "../config/data-source";
import { Language } from "../models/programming-languages";

const programmingLanguages = [
  "JavaScript",
  "Python",
  "Java",
  "C#",
  "C++",
  "Ruby",
  "Go",
  "Rust",
  "TypeScript",
  "Kotlin",
  "Swift",
  "PHP",
  "Scala",
  "Dart",
  "Elixir",
  "Perl",
  "Haskell",
  "R",
  "MATLAB",
  "Objective-C",
];

import "reflect-metadata";

async function populateDb() {
  await AppDataSource.initialize();

  console.log(`Database connection ready`);

  const languageRepository = AppDataSource.getRepository(Language);

  for (let language of programmingLanguages) {
    console.log(`inserting course ${language}`);
    const lang = languageRepository.create({ name: language });

    await languageRepository.save(lang);
  }
}

populateDb()
  .then(() => {
    console.log(`Finished populating database,exiting!`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(`Error populating database`, err);
  });
