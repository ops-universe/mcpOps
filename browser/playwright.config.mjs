import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'.',testMatch:'acceptance.spec.mjs',timeout:30000,retries:0,workers:1,use:{browserName:'chromium',headless:true,trace:'retain-on-failure',screenshot:'only-on-failure'},reporter:'list'});
