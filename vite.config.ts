import { defineConfig } from 'vite';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];

export default defineConfig({
  // GitHub Pages project sites are served from /<repo-name>/.
  base: process.env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : '/',
});
