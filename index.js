const fs = require("fs");

const startingDir = process.argv[2];
const desiredExtension = process.argv[3];
const replacementExtension = process.argv[4];

const getCodeOwners = () => {
  const fileContent = fs.readFileSync(
    `${startingDir}/.github/CODEOWNERS`,
    "utf8"
  );
  const lines = fileContent.split("\n");

  return lines.reduce((output, line) => {
    const [path, team] = line.split(" ");
    if (path === undefined || team === undefined) return output;

    if (output[team] === undefined) output[team] = [path];
    else output[team].push(path);

    return output;
  }, {});
};

const getFiles = (currentDir) => {
  return fs.readdirSync(currentDir).flatMap((name) => {
    const newPath = `${currentDir}/${name}`;
    if (fs.lstatSync(newPath).isDirectory()) return getFiles(newPath);
    return newPath.replace(startingDir, "");
  });
};

const getMatchingFileExtensions = (extension, files) =>
  files.filter((file) => extension.test(file));

const findFileOwner = (owners, file) => {
  return Object.entries(owners).find(([owner, directories]) =>
    directories.find((dir) => file.startsWith(dir))
  )?.[0];
};

const sortByFileOwners = (owners, files) => {
  return files.reduce((output, file) => {
    const owner = findFileOwner(owners, file);
    if (owner === undefined) return output;
    if (output[owner] === undefined) output[owner] = 1;
    else output[owner] = output[owner] + 1;
    return output;
  }, {});
};

const files = getFiles(startingDir);
const owners = getCodeOwners();

const desiredFiles = getMatchingFileExtensions(
  new RegExp(desiredExtension),
  files
);
const replacementFiles = getMatchingFileExtensions(
  new RegExp(replacementExtension),
  files
);

const desiredOwners = sortByFileOwners(owners, desiredFiles);
const replacementOwners = sortByFileOwners(owners, replacementFiles);

console.log({
  [desiredExtension]: desiredOwners,
  [replacementExtension]: replacementOwners,
});
