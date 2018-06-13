<template>
  <el-container class="browser-container">
    <el-header class="browser-header">
      <el-input v-model="repoUrl" placeholder="请输入项目地址" prefix-icon="el-icon-search" @keyup.enter.native="submitUrl"></el-input>
    </el-header>
    <el-main class="browser-main">
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
  import fs from 'fs-extra';
  import path from 'path';
  import repository from '../utils/repository';

  export default {
    computed: {
      repoUrl: {
        get() {
          return this.$store.state.Global.repoUrl;
        },
        set(value) {
          this.$store.dispatch('setRepoUrl', value);
        },
      },
    },
    methods: {
      async submitUrl() {
        console.log('check url:', this.repoUrl);
        const oriRepositoryDir = this.repoUrl;
        const isExists = await fs.pathExists(oriRepositoryDir);
        if (isExists) {
          const repositoryName = path.basename(oriRepositoryDir);
          this.switchToRepository(repositoryName);
        } else if (oriRepositoryDir.startsWith('http')) {
          // 下载项目
          const loading = this.$loading({
            lock: true,
            text: '正在下载项目',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)',
          });
          const repositoryPath = await repository.downRepository(oriRepositoryDir);
          const repositoryName = path.basename(repositoryPath);
          loading.close();

          this.repoUrl = repositoryPath;
          this.switchToRepository(repositoryName);
        } else {
          this.$message.warning('该项目不存在');
        }
      },
      switchToRepository(repositoryName) {
        this.$router.push(`/repository/${repositoryName}`);
      },
    },
  };
</script>

<style lang="scss">
body {
  margin: 0;
}

.browser-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  .browser-header {
    padding-top: 10px;
    border-bottom: 1px solid #eee;
  }

  .browser-main {
    flex: 1;
    padding: 16px 20px;
  }
}


</style>
