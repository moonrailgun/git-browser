<template>
  <div class="repo">
    <div class="navigation">
      <el-select v-model="currentHash" @change="handleHashChange" placeholder="请选择commit" class="commit">
        <el-option
          v-for="log in gitLogs"
          :key="log.hash"
          :label="log.hash.substr(0,6)+' - '+log.subject"
          :value="log.hash">
        </el-option>
      </el-select>
      <span> / </span>
      <el-select v-model="currentBranch" @change="handleBranchChange" placeholder="请选择分支" class="branch">
        <el-option
          v-for="branch in gitBranchs"
          :key="branch"
          :label="branch"
          :value="branch">
        </el-option>
      </el-select>
      <span> / {{$route.params.repositoryName}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <el-checkbox v-model="isDiffMode" label="比对模式" @change="updateFileContent" border></el-checkbox>
      <span v-if="isDiffMode">
        <span>比对步数:</span>
        <el-input-number v-model="diffStep" controls-position="right" @change="updateFileContent" :min="1" :max="10"></el-input-number>
      </span>
    </div>
    <div class="info">
      <div class="tree">
        <el-tree
          :data="dirTree"
          node-key="label"
          :default-expanded-keys="[$route.params.repositoryName]"
          @node-click="handleNodeClick"
          accordion>
        </el-tree>
      </div>
      <div class="main">
        <p v-if="!currentFileContent && !currentFileInfo">
          请选择文件
        </p>
        <!-- <pre v-else v-highlightjs="currentFileContent"><code></code></pre> -->
        <Code v-else :code="currentFileContent" :key="Math.random()" />
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
  import Code from './Shared/Code';

  export default {
    data() {
      return {
        currentHash: '',
        currentBranch: '',
        dirTree: [],
        gitLogs: [],
        gitBranchs: [],
        currentFileContent: '',
        currentFileInfo: null,
        tempRepositoryDir: '',
        isDiffMode: false,
        diffStep: 1,
      };
    },
    computed: {
      ...mapState({
        repoUrl: state => state.Global.repoUrl,
      }),
    },
    components: {
      Code,
    },
    mounted() {
      this.init();
    },
    beforeRouteUpdate() {
      console.log('route update');
      this.init();
    },
    methods: {
      dataClear() {
        this.currentHash = '';
        this.currentBranch = '';
        this.gitBranchs = [];
        this.dirTree = [];
        this.gitLogs = [];
        this.currentFileContent = '';
      },
      async init() {
        // init temp repo
        console.log('init');
        const oriRepositoryDir = this.repoUrl;
        const repositoryName = path.basename(oriRepositoryDir);
        let tempRepositoryDir = await repository.getTempRepositoryDir(repositoryName);
        console.log('临时项目地址:', tempRepositoryDir);
        this.dataClear();

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
        this.tempRepositoryDir = tempRepositoryDir;
        this.gitLogs = await git.getLog(tempRepositoryDir);
        this.dirTree = [await repository.getDirTree(tempRepositoryDir)];
        this.currentHash = this.gitLogs[0].hash;
        const branchInfo = await git.getBranch(tempRepositoryDir);
        this.currentBranch = branchInfo.currentBranch;
        this.gitBranchs = branchInfo.branchs;
      },
      async handleNodeClick(data) {
        if (data.type === 'directory' || data.children) {
          return;
        }
        console.log(data);

        this.currentFileInfo = data;
        this.updateFileContent();
      },
      async handleHashChange() {
        try {
          await git.switchHash(this.tempRepositoryDir, this.currentHash);
          this.updateDirTree();
        } catch (e) {
          console.error(e);
          this.$message.error(e.toString());
        }
      },
      async handleBranchChange() {
        try {
          await git.switchHash(this.tempRepositoryDir, this.currentBranch);
          this.updateDirTree();
        } catch (e) {
          console.error(e);
          this.$message.error(e.toString());
        }
      },
      async updateDirTree() {
        this.dirTree = [await repository.getDirTree(this.tempRepositoryDir)];// 更新文件树
        try {
          this.updateFileContent();
        } catch (e) {
          this.currentFileContent = null;// 更新文件
        }
      },
      async updateFileContent() {
        if (!this.isDiffMode) {
          // 显示文件内容
          console.log('显示文件内容');
          if (this.currentFileInfo && this.currentFileInfo.path) {
            this.currentFileContent = await fs.readFile(this.currentFileInfo.path, 'utf8');// 更新文件
          }
        } else {
          // 显示diff
          console.log('显示diff');
          if (this.currentFileInfo && this.currentFileInfo.path) {
            const filepath = path.relative(this.tempRepositoryDir, this.currentFileInfo.path);
            this.currentFileContent = await git.getFileDiff(this.tempRepositoryDir,
              filepath, this.diffStep);// 更新文件
          }
        }
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

      .is-current > .el-tree-node__content {
        background-color: #f5f7fa;
        color: #409EFF;
        font-weight: 700;
      }
    }

    .main {
      flex: 1;
      overflow: auto;
      padding-left: 4px;

      pre {
        margin: 0;
      }
    }
  }
}
</style>
