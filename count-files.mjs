import { getFiles, getCodeOwners, sortFilesByOwner, getFileCount } from "./utils.mjs";

export const countFiles = (startingDir, extensions) => {
  const files = getFiles(startingDir);
  const owners = getCodeOwners(startingDir);
  const filesByOwner = sortFilesByOwner(extensions, files, owners);
  const output = getFileCount(filesByOwner);

  console.log(JSON.stringify(output, null, 2));
};
