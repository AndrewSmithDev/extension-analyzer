#!/usr/bin/env node
import { countFiles } from "./count-files.mjs";
import { listFiles } from "./get-file-list.mjs";

const action = process.argv[2];
const startingDir = process.argv[3];

if (startingDir === undefined) {
  console.log("No path provided");
  console.log("Example call: extension-analyzer ~/project/example jsx? tsx?");
  process.exit(-1);
}

if (action === "--count") {
  const extensionsArg = process.argv.splice(4);
  if (extensionsArg.length === 0) {
    console.log("No extensions provided");
    console.log("Example call: extension-analyzer ~/project/example jsx? tsx?");
    process.exit(-1);
  }
  const extensions = extensionsArg.map((ext) => ({
    name: ext,
    regex: new RegExp(`(\\.${ext})$`),
  }));

  countFiles(startingDir, extensions);
}

if (action === "--list") {
  const extension = process.argv[4];
  const team = process.argv[5];
  listFiles(startingDir, extension, team);
}
