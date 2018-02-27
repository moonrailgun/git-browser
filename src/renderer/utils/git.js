/* eslint-disable */
import execa from 'execa';

export default {
  async getLog(cwd) {
    const gl = await execa.shell('git log --format=oneline', {
      cwd,
    });
    let logs = gl.stdout;
    logs = logs.split('\n');
    logs = logs.map(line => ({
      hash: line.substr(0,40),
      comment: line.substr(41),
    }))
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
