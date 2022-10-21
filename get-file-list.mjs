#!/usr/bin/env node
import {
  getFiles,
  getCodeOwners,
  sortFilesByOwner,
  getLineCount,
  outputLineCount,
} from "./utils.mjs";

const startingDir = process.argv[2];
const extensionsArg = process.argv.splice(3);

if (startingDir === undefined) {
  console.log("No path provided");
  console.log("Example call: extension-analyzer ~/project/example jsx? tsx?");
  process.exit(-1);
}

if (extensionsArg.length === 0) {
  console.log("No extensions provided");
  console.log("Example call: extension-analyzer ~/project/example jsx? tsx?");
  process.exit(-1);
}

const extensions = extensionsArg.map((ext) => ({
  name: ext,
  regex: new RegExp(`(\\.${ext})$`),
}));

const files = getFiles(startingDir);
const owners = getCodeOwners(startingDir);
const filesByOwner = sortFilesByOwner(extensions, files, owners);
const teamFiles = filesByOwner["@agencyanalytics/client-platforms"]["jsx?"];
const filesWithLineCount = await getLineCount(startingDir, teamFiles).then((x) =>
  x.sort((a, b) => a[0] - b[0])
);
outputLineCount(filesWithLineCount);
