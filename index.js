#!/usr/bin/env node

const fs = require("fs");

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

const getCodeOwners = (rootDir) => {
  const fileContent = fs.readFileSync(`${rootDir}/.github/CODEOWNERS`, "utf8");
  const lines = fileContent.split("\n");

  return lines.reduce((output, line) => {
    const [path, team] = line.split(" ");
    if (path === undefined || team === undefined) return output;

    if (output[team] === undefined) output[team] = [path];
    else output[team].push(path);

    return output;
  }, {});
};

const getFiles = (rootDir, currentDir = rootDir) => {
  return fs.readdirSync(currentDir).flatMap((name) => {
    const newPath = `${currentDir}/${name}`;
    if (fs.lstatSync(newPath).isDirectory()) return getFiles(rootDir, newPath);
    return newPath.replace(rootDir, "");
  });
};

const getFileOwner = (owners, file) => {
  return Object.entries(owners).find(([owner, dirs]) =>
    dirs.find((dir) => file.startsWith(dir))
  )?.[0];
};

const getFileExtension = (extensions, file) => {
  const ext = extensions.find(({ regex }) => regex.test(file));
  return ext?.name;
};

const sortFilesByOwner = (extensions, files, owners) => {
  return files.reduce((output, file) => {
    const owner = getFileOwner(owners, file);
    if (owner === undefined) return output;

    const fileExtension = getFileExtension(extensions, file);
    if (fileExtension === undefined) return output;

    if (output[owner] === undefined) output[owner] = {};
    if (output[owner][fileExtension] === undefined)
      output[owner][fileExtension] = 1;
    else output[owner][fileExtension] += 1;

    return output;
  }, {});
};

const files = getFiles(startingDir);
const owners = getCodeOwners(startingDir);
const output = sortFilesByOwner(extensions, files, owners);

console.log(JSON.stringify(output, null, 2));
