import fs from 'fs-extra';
import path from 'path';
import { remote } from 'electron';
import walkSync from 'walk-sync';
import dirTree from 'directory-tree';
import globby from 'globby';
import git from './git';

function getTempPath(repositoryName = '') {
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

      console.log('[repository]', 'copy task run... size:', copyTask.length);
      await Promise.all(copyTask);// 顺序发送异步处理   //TODO:需要优化, 改为使用copy的过滤方法否则大文件无法正常复制
      console.log('[repository]', 'start drop uncommited content...');
      await git.dropCurrentWorkspace(tempPath); // 去除当前未提交的修改内容
      console.timeEnd('copyTask');
      console.log('[repository]', 'create repository done:', tempPath);
    } catch (err) {
      console.error(err);
      await fs.remove(tempPath);
    }

    return tempPath;
  },
  async getDirTree(repositoryDir) {
    const formatTree = function formatTree(dir) {
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
  async downRepository(url) {
    console.log('start download repository:', url);
    let tmp = url.split('/');
    tmp = tmp[tmp.length - 1];
    tmp = tmp.split('.');
    const repoName = tmp[0];
    const repoPath = getTempPath(repoName);
    await fs.remove(repoPath);
    await git.clone(getTempPath(), url);
    return repoPath;
  },
};
