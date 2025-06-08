import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import EnvironmentPlugin from 'vite-plugin-environment';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    EnvironmentPlugin({
      'DFX_NETWORK': 'local',
      'CANISTER_ID_STUDENT_IDENTITY_SERVICE': 'vu5yx-eh777-77774-qaaga-cai',
      'CANISTER_ID_CREDIT_ASSESSMENT_SERVICE': 'vt46d-j7777-77774-qaagq-cai',
      'CANISTER_ID_LOAN_MANAGEMENT_SERVICE': 'vpyes-67777-77774-qaaeq-cai',
      'CANISTER_ID_DAO_GOVERNANCE_SERVICE': 'vb2j2-fp777-77774-qaafq-cai',
      'CANISTER_ID_COMPLIANCE_SERVICE': 'vg3po-ix777-77774-qaafa-cai',
      'CANISTER_ID_UNIVERSITY_CREDENTIAL_SERVICE': 'v56tl-sp777-77774-qaahq-cai',
      'CANISTER_ID_AUTHENTICATION_SERVICE': 'va3tl-sp777-77774-qaahq-cai',
      'CANISTER_ID_INTERNET_IDENTITY': 'rdmx6-jaaaa-aaaaa-aaadq-cai'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'declarations': path.resolve(__dirname, '../declarations'),
    },
  },
  build: {
    // generate manifest.json in outDir
    manifest: true,
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4943',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
