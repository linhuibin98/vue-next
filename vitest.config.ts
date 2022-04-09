import { defineConfig } from 'vitest/config';
import {join} from 'path';

export default defineConfig({
    resolve: {
        alias: [
            { find: /@vue\/(\w+)/, replacement: join(__dirname, `packages/$1/src`) },
        ]
    },
    test: {},
})