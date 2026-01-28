import type { Preview } from '@storybook/react';
import '../../frontend/src/styles/index.css';

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        backgrounds: {
            default: 'cream',
            values: [
                { name: 'cream', value: '#F5F0E1' },
                { name: 'cream-dark', value: '#E8E4D9' },
                { name: 'brown', value: '#2D2A26' },
            ],
        },
    },
};

export default preview;
