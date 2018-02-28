<template>
  <div class="repo">
    <div class="aside">
      <p v-for="log in gitLogs">
        {{log.hash.substr(0,6)}} - {{log.subject}}
      </p>
    </div>
    <div class="main">
      main: {{$route.params.repositoryName}}
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex';
  // import fs from 'fs-extra';
  import path from 'path';
  // import walkSync from 'walk-sync';
  import git from '../utils/git';
  import repository from '../utils/repository';

  export default {
    data() {
      return {
        dirTree: {},
        gitLogs: [],
      };
    },
    computed: {
      ...mapState({
        repoUrl: state => state.Global.repoUrl,
      }),
    },
    mounted() {
      this.init();
    },
    beforeRouteUpdate() {
      console.log('update');
      this.init();
    },
    methods: {
      async init() {
        try {
          // init temp repo
          const oriRepositoryDir = this.repoUrl;
          const repositoryName = path.basename(oriRepositoryDir);
          let tempRepositoryDir = await repository.getTempRepositoryDir(repositoryName);
          console.log('临时项目地址:', tempRepositoryDir);
          if (!tempRepositoryDir) {
            // 未创建的话先创建
            tempRepositoryDir = await repository.createTempRepositoryDir(oriRepositoryDir);
          } else {
            // 已创建的话检测是否最近版本
            const oriLastCommit = await git.getLastCommitHash(oriRepositoryDir);
            const tempLastCommit = await git.getLastCommitHash(tempRepositoryDir);

            if (oriLastCommit !== tempLastCommit) {
              // 临时项目文件夹不匹配需要更新
              tempRepositoryDir = await repository.createTempRepositoryDir(oriRepositoryDir);
            }
          }
          const logs = await git.getLog(tempRepositoryDir);
          this.gitLogs = logs;

          console.log(await repository.getDirTree(tempRepositoryDir));
        } catch (e) {
          console.error(e);
          this.$message.error(e.toString());
        }
      },
    },
  };
</script>

<style lang="scss">
.repo {
  display: flex;

  .aside {
    width: 200px;
    overflow: auto;

    p {
      margin: 0;
    }
  }

  .main {
    flex: 1;
  }
}
</style>
