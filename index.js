const fs = require("fs");

const startingDir = process.argv[2];
const extensions = process.argv.splice(3);
const extensionRegex = extensions.map((ext) => new RegExp(`(\\.${ext})$`));

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

const getFileOwner = (owners, file) => {
  return Object.entries(owners).find(([owner, dirs]) =>
    dirs.find((dir) => file.startsWith(dir))
  )?.[0];
};

const getFileExtension = (file) => {
  const index = extensionRegex.findIndex((ext) => ext.test(file));
  const val = extensions[index];
  return val;
};

const sortFilesByOwner = (files, owners) => {
  return files.reduce((output, file) => {
    const owner = getFileOwner(owners, file);
    if (owner === undefined) return output;

    const fileExtension = getFileExtension(file);
    if (fileExtension === undefined) return output;

    if (output[owner] === undefined) output[owner] = {};
    if (output[owner][fileExtension] === undefined)
      output[owner][fileExtension] = 1;
    else output[owner][fileExtension] += 1;

    return output;
  }, {});
};

const files = getFiles(startingDir);
const owners = getCodeOwners();
const output = sortFilesByOwner(files, owners);

console.log(JSON.stringify(output, null, 2));
