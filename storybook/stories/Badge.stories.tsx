import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/components/ui';

const meta = {
    title: 'UI/Badge',
    component: Badge,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        tier: {
            control: 'select',
            options: ['default', 'bronze', 'silver', 'gold', 'platinum'],
        },
    },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: 'Viendo',
    },
};

export const Bronze: Story = {
    args: {
        tier: 'bronze',
        children: 'Bronce',
    },
};

export const Silver: Story = {
    args: {
        tier: 'silver',
        children: 'Plata',
    },
};

export const Gold: Story = {
    args: {
        tier: 'gold',
        children: 'Oro',
    },
};

export const Platinum: Story = {
    args: {
        tier: 'platinum',
        children: 'Platino',
    },
};

export const AllTiers: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Badge>Default</Badge>
            <Badge tier="bronze">Bronce</Badge>
            <Badge tier="silver">Plata</Badge>
            <Badge tier="gold">Oro</Badge>
            <Badge tier="platinum">Platino</Badge>
        </div>
    ),
};
