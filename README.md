The script will extract the teams from the CODEOWNERS file, then for each team the script will
recursively walk the through the directories that the team owns, and it will count the number of
files that match the provided extensions

Example usuage:

```bash
extension-analyzer /home/andrew/projects/example jsx? tsx?
```

Example output
```json
{
  "@example/team-1": {
    "tsx?": 27,
    "jsx?": 1
  },
  "@example/team-2": {
    "jsx?": 380,
    "tsx?": 149
  },
}
```