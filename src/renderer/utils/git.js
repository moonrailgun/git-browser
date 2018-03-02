import execa from 'execa';

export default {
  async getLog(cwd) {
    if (!cwd) throw new Error('cwd is required!');
    console.time('[git] get log');
    const gl = await execa.shell("git log --no-merges --date=format:'%Y-%m-%d %H:%M:%S' --pretty=format:'%H - %s <%an> %d'", {
      cwd,
    });
    let logs = gl.stdout;
    // 正则表达式
    const reg = /^(\S{40})\s-\s(.*?)\s<(.*?)>.*?(.*?)$/;
    logs = logs.split('\n');
    logs = logs.map(line => {
      const matched = reg.exec(line);
      if (matched) {
        let extra = matched[4];
        extra = extra.trim();
        return {
          hash: matched[1],
          subject: matched[2],
          author: matched[3],
          extra,
        };
      }
      return {};
    });
    console.timeEnd('[git] get log');
    return logs;
  },
  async getBranch(cwd) {
    if (!cwd) throw new Error('cwd is required!');
    const gb = await execa.shell('git branch', {
      cwd,
    });
    let branchs = gb.stdout;
    let currentBranch = '';
    branchs = branchs.split('\n').map(line => {
      const branchName = line.substr(2);
      if (line[0] === '*') {
        currentBranch = branchName;
      }
      return branchName;
    });

    return {
      currentBranch,
      branchs,
    };
  },
  async getLastCommitHash(cwd) {
    if (!cwd) throw new Error('cwd is required!');
    const gl = await execa.shell('git log -1 --format=oneline', {
      cwd,
    });
    const lastLog = gl.stdout;
    const hash = lastLog.split(' ')[0];
    return hash;
  },
  async dropCurrentWorkspace(cwd) {
    if (!cwd) throw new Error('cwd is required!');
    const gl = await execa.shell('git checkout -- .', {
      cwd,
    });
    const lastLog = gl.stdout;
    return lastLog;
  },
  async switchHash(cwd, hash) {
    if (!cwd) throw new Error('cwd is required!');
    if (!hash) throw new Error('hash is required!');
    const gc = await execa.shell(`git checkout ${hash}`, {
      cwd,
    });
    const info = gc.stdout;
    return info;
  },
  async getFileDiff(cwd, file, step = 1) {
    if (!cwd) throw new Error('cwd is required!');
    if (!file) throw new Error('file is required!');
    const gd = await execa.shell(`git diff HEAD~${step}...HEAD ${file}`, {
      cwd,
    });
    const diff = gd.stdout;
    return diff;
  },
  async getHashFileContent(cwd, hash, file) {
    if (!cwd) throw new Error('cwd is required!');
    if (!hash) throw new Error('hash is required!');
    if (!file) throw new Error('file is required!');
    const gfc = await execa.shell(`git show ${hash}:${file}`, {
      cwd,
    });
    const diff = gfc.stdout;
    return diff;
  },
};
