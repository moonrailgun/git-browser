import fs from 'fs-extra';
import path from 'path';
import { remote } from 'electron';
import walkSync from 'walk-sync';
import globby from 'globby';

function getTempPath(repositoryName) {
  return path.join(remote.app.getPath('userData'), './git-browser/repo/', `./${repositoryName}`);
}

export default {
  async getTempRepositoryDir(repositoryName) {
    const tempPath = getTempPath(repositoryName);
    const isExists = await fs.pathExists(tempPath);
    if (isExists) {
      return tempPath;
    }
    return false;
  },
  async createTempRepositoryDir(repositoryDir) {
    const repositoryName = path.basename(repositoryDir);
    const tempPath = getTempPath(repositoryName);
    const isExists = await fs.pathExists(tempPath);
    if (isExists) {
      await fs.remove(tempPath);
    }
    try {
      console.log('[repository]', 'copy start...');
      const isIgnored = await globby.gitignore(repositoryDir);
      console.log('isIgnored', isIgnored);
      // TODO
      const paths = walkSync(repositoryDir, { directories: false });
      for (let i = 0; i < paths.length; i += 1) {
        const p = paths[i];
        console.log(p);
      }

      // fs.copy(repositoryDir, tempPath, {
      //   filter: () => {
      //     // const relativePath = path.relative(repositoryDir, src);
      //     // const isPass = !isIgnored(relativePath);
      //     const isPass = Math.random() < 0.5;
      //     console.log(isPass);
      //     return isPass;
      //   },
      // }, (err) => {
      //   if (err) return console.error(err);
      //
      //   console.log('success!');
      //   return null;
      // });
      console.log('[repository]', 'copy done:', tempPath);
    } catch (err) {
      console.error(err);
      await fs.remove(tempPath);
    }

    return tempPath;
  },
};
