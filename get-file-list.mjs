#!/usr/bin/env node
import {
  getFiles,
  getCodeOwners,
  sortFilesByOwner,
  getLineCount,
  outputLineCount,
} from "./utils.mjs";

export const listFiles = async (startingDir, extension, team) => {
  const extensions = [
    {
      name: extension,
      regex: new RegExp(`(\\.${extension})$`),
    },
  ];

  const files = getFiles(startingDir);
  const owners = getCodeOwners(startingDir);
  const filesByOwner = sortFilesByOwner(extensions, files, owners);
  const teamFiles = filesByOwner[team][extension];
  const filesWithLineCount = await getLineCount(startingDir, teamFiles).then((x) =>
    x.sort((a, b) => a[0] - b[0])
  );
  outputLineCount(filesWithLineCount);
};
