<template>
  <div>
    main: {{$route.params.repositoryName}}
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
          console.log(logs);

          // load ignore file
          // let ignoreFile = await fs.readFile(path.join(tempRepositoryDir, './.gitignore'));
          // ignoreFile = ignoreFile.toString().split('\n').filter(i => {
          //   if (!i) {
          //     return false;
          //   }
          //   if (i.trim()[0] === '#') {
          //     return false;
          //   }
          //   return true;
          // });
          // ignoreFile.push('.git');

          // console.log(walkSync(tempRepositoryDir, {
          //   directories: true,
          //   ignore: ignoreFile,
          // }).length);
          // this.dirTree = walkSync(tempRepositoryDir, { directories: false, ignore: ignoreFile });
          // console.log(this.dirTree);
        } catch (e) {
          console.error(e);
          this.$message.error(e.toString());
        }
      },
    },
  };
</script>
