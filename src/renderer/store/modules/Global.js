const state = {
  repoUrl: '/Users/moonrailgun/Develop/Inventory/git-browser',
};

const mutations = {
  SET_REPO_URL(state, { url }) {
    state.repoUrl = url;
  },
};

const actions = {
  setRepoUrl({ commit }, url) {
    commit('SET_REPO_URL', { url });
  },
};

export default {
  state,
  mutations,
  actions,
};
