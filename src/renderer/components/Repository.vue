<template>
  <div class="repo">
    <div class="navigation">
      <el-select v-model="currentHash" placeholder="请选择" class="commit">
        <el-option
          v-for="log in gitLogs"
          :key="log.hash"
          :label="log.hash+'-'+log.subject"
          :value="log.hash">
        </el-option>
      </el-select>
      <span> / {{$route.params.repositoryName}}</span>
    </div>
    <div class="info">
      <div class="tree">
        <el-tree
          :data="dirTree"
          @node-click="handleNodeClick"
          accordion>
        </el-tree>
      </div>
      <div class="main">
        <p v-if="!currentFileContent">
          请选择文件
        </p>
        <div v-else>
          <pre>{{currentFileContent}}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex';
  import fs from 'fs-extra';
  import path from 'path';
  import git from '../utils/git';
  import repository from '../utils/repository';

  export default {
    data() {
      return {
        currentHash: '',
        dirTree: [],
        gitLogs: [],
        currentFileContent: '',
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
          this.gitLogs = await git.getLog(tempRepositoryDir);
          this.dirTree = [await repository.getDirTree(tempRepositoryDir)];
        } catch (e) {
          console.error(e);
          this.$message.error(e.toString());
        }
      },
      async handleNodeClick(data) {
        console.log(data);
        if (data.children) {
          return;
        }

        const fc = await fs.readFile(data.path, 'utf8');
        this.currentFileContent = fc;
      },
    },
  };
</script>

<style lang="scss">
.repo {
  display: flex;
  flex-direction: column;
  height: 100%;

  .navigation {
    margin-bottom: 10px;

    .el-select input {
      user-select: none;
    }
  }

  .info {
    display: flex;
    height: 100%;

    .tree {
      width: 230px;
      overflow: auto;
      border-right: 1px solid #eee;
      user-select: none;
    }

    .main {
      flex: 1;
      overflow: auto;
      padding-left: 4px;
    }
  }
}
</style>
