import fs from 'fs-extra';
import path from 'path';
import { remote } from 'electron';
import walkSync from 'walk-sync';
import dirTree from 'directory-tree';
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
      console.time('copyTask');
      const isIgnored = await globby.gitignore(repositoryDir);
      const paths = walkSync(repositoryDir, { directories: false });
      const copyTask = [];
      for (let i = 0; i < paths.length; i += 1) {
        const p = paths[i];
        if (!isIgnored(p)) {
          copyTask.push(fs.copy(path.join(repositoryDir, p), path.join(tempPath, p)));
        }
      }

      await Promise.all(copyTask);// 顺序发送异步处理
      console.timeEnd('copyTask');
      console.log('[repository]', 'copy done:', tempPath);
    } catch (err) {
      console.error(err);
      await fs.remove(tempPath);
    }

    return tempPath;
  },
  async getDirTree(repositoryDir) {
    const formatTree = function (dir) {
      const children = dir.children;
      dir.label = dir.name;
      if (children) {
        for (let i = 0; i < children.length; i++) {
          formatTree(children[i]);
        }
      }
    };
    const res = dirTree(repositoryDir);
    formatTree(res);
    return res;
  },
};
