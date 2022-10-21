import fs from "fs";

export const getCodeOwners = (rootDir) => {
  const fileContent = fs.readFileSync(`${rootDir}/.github/CODEOWNERS`, "utf8");
  const lines = fileContent.split("\n");

  return lines.reduce((output, line) => {
    if (line[0] !== "/") return output;

    const [path, team] = line.split(" ");
    if (!path || !team) return output;

    output.push({ team, path });

    return output;
  }, []);
};

export const getFiles = (rootDir, currentDir = rootDir) => {
  return fs.readdirSync(currentDir).flatMap((name) => {
    const newPath = `${currentDir}/${name}`;
    if (fs.lstatSync(newPath).isDirectory()) return getFiles(rootDir, newPath);
    return newPath.replace(rootDir, "");
  });
};

export const getFileOwner = (owners, file) => {
  const owner = owners.reduce((currentOwner, nextTeam) => {
    if (file.startsWith(nextTeam.path)) {
      if (!currentOwner) return nextTeam;
      // NOTE: we only want to assign the next team if the nextTeam's path is longer than the
      // currentOwner so that the team with the more specific path owners the file
      // i.e. if TeamA owners /src/components/layout and teamB owners /src/components then
      // TeamA should own all files in /src/components/layout
      if (nextTeam.path.length > currentOwner.path.length) return nextTeam;
    }
    return currentOwner;
  }, undefined);

  return owner?.team;
};

export const getFileExtension = (extensions, file) => {
  const ext = extensions.find(({ regex }) => regex.test(file));
  return ext?.name;
};

export const sortFilesByOwner = (extensions, files, owners) => {
  return files.reduce((output, file) => {
    const owner = getFileOwner(owners, file);
    if (owner === undefined) return output;

    const fileExtension = getFileExtension(extensions, file);
    if (fileExtension === undefined) return output;

    if (output[owner] === undefined) output[owner] = {};
    if (output[owner][fileExtension] === undefined) output[owner][fileExtension] = [file];
    else output[owner][fileExtension].push(file);

    return output;
  }, {});
};

export const getFileCount = (filesByOwner) => {
  return Object.fromEntries(
    Object.entries(filesByOwner).map(([team, exts]) => {
      const extsWithCount = Object.entries(exts).map(([ext, files]) => [ext, files.length]);
      return [team, Object.fromEntries(extsWithCount)];
    })
  );
};
