import * as fs from 'fs';
import * as path from 'path';
import { preprocess } from "./index.mjs";

async function test() {
  const inputdir = await fs.promises.opendir('./test/in');
  for await (const dirent of inputdir) {
    if (dirent.isFile()) {
      const inputFile = path.join('./test/in', dirent.name);
      const outputFile = path.join('./test/out', dirent.name);
      const input = await fs.promises.readFile(inputFile, 'utf-8');
      const expected = await fs.promises.readFile(outputFile, 'utf-8');
      const actual = preprocess(input, { DEFINED: true });

      if (actual !== expected) {
        console.error({ input, actual, expected });
      }
    }
  }
}

test();
