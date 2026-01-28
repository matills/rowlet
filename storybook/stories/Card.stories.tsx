import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardImage, CardBody, CardTitle, CardText } from '@/components/ui';

const meta = {
    title: 'UI/Card',
    component: Card,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Card>
            <CardBody>
                <CardTitle>Título de la card</CardTitle>
                <CardText>
                    Esta es una card con estilo vintage de los años 30.
                </CardText>
            </CardBody>
        </Card>
    ),
};

export const Interactive: Story = {
    render: () => (
        <Card interactive>
            <CardBody>
                <CardTitle>Card interactiva</CardTitle>
                <CardText>
                    Pasa el mouse para ver el efecto hover.
                </CardText>
            </CardBody>
        </Card>
    ),
};

export const WithImage: Story = {
    render: () => (
        <div style={{ width: '250px' }}>
            <Card interactive>
                <CardImage
                    src="https://via.placeholder.com/250x375"
                    alt="Poster de ejemplo"
                />
                <CardBody>
                    <CardTitle>Película ejemplo</CardTitle>
                    <CardText>2024 • Drama</CardText>
                </CardBody>
            </Card>
        </div>
    ),
};

export const CardGrid: Story = {
    render: () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 200px)', gap: '16px' }}>
            {[1, 2, 3].map((i) => (
                <Card key={i} interactive>
                    <CardImage
                        src={`https://via.placeholder.com/200x300?text=Movie+${i}`}
                        alt={`Movie ${i}`}
                    />
                    <CardBody>
                        <CardTitle>Película {i}</CardTitle>
                        <CardText>2024 • Acción</CardText>
                    </CardBody>
                </Card>
            ))}
        </div>
    ),
};
