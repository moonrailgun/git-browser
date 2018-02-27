/* eslint-disable */
import execa from 'execa';

export default {
  async getLog(cwd) {
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
      if(matched) {
        let extra = matched[4];
        extra = extra.trim();
        return {
          hash: matched[1],
          subject: matched[2],
          author: matched[3],
          extra,
        }
      }else {
        return {}
      }
    })
    console.timeEnd('[git] get log');
    return logs;
  },
  async getLastCommitHash(cwd) {
    const gl = await execa.shell('git log -1 --format=oneline', {
      cwd,
    });
    const lastLog = gl.stdout;
    return lastLog;
  }
};
