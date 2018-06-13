<template>
  <pre class="prettyprint linenums" ref="codeContainer"><code>{{code}}</code></pre>
  <!-- <pre v-highlightjs="code"><code></code></pre> -->
</template>

<script>
import 'code-prettify';
import 'code-prettify/src/prettify.css';

export default {
  props: [
    'code',
  ],
  mounted() {
    window.PR.prettyPrint();
    const codeContainer = this.$refs.codeContainer;
    const lines = codeContainer.children[0].children;
    for (let i = 0; i < lines.length; i++) {
      const node = lines[i];
      node.dataset.num = i + 1;
    }
  },
};
</script>

<style>
pre.prettyprint {
  width: 100%;
  height: 100%;
  overflow: auto;
  margin: 0;
  padding: 0;
  border: 0;
  background-color: rgba(200, 200, 200, 0.1);
  position: relative;
}

pre.prettyprint > ol > li {
  list-style-type: none !important;
  line-height: 20px;
}

pre.prettyprint > ol > li:before {
  content: attr(data-num);
  position: absolute;
  width: 30px;
  left: 0;
  text-align: right;
  padding-right: 6px;
  line-height: 20px;
  color: rgba(27,31,35,0.3);
}

li.L1, li.L3, li.L5, li.L7, li.L9 {
  background: transparent;
}
</style>
