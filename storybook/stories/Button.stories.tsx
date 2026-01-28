import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui';

const meta = {
    title: 'UI/Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'gold'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        variant: 'primary',
        children: 'Botón primario',
    },
};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'Botón secundario',
    },
};

export const Gold: Story = {
    args: {
        variant: 'gold',
        children: 'Botón dorado',
    },
};

export const Small: Story = {
    args: {
        variant: 'primary',
        size: 'sm',
        children: 'Pequeño',
    },
};

export const Large: Story = {
    args: {
        variant: 'primary',
        size: 'lg',
        children: 'Grande',
    },
};

export const Disabled: Story = {
    args: {
        variant: 'primary',
        disabled: true,
        children: 'Deshabilitado',
    },
};
