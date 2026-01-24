# Skill: /new-component

## Descripción
Genera un nuevo componente React con TypeScript, estilo Cuphead, y estructura completa.

## Uso

```bash
/new-component <ComponentName> [opciones]
```

### Opciones
- `--with-animation`: Incluye animaciones Framer Motion
- `--with-test`: Incluye archivo de test
- `--with-story`: Incluye Storybook story
- `--variant`: Tipo de componente (ui, feature, layout)

### Ejemplos

```bash
/new-component Button --variant=ui --with-animation
/new-component MovieCard --variant=feature --with-test
/new-component Header --variant=layout
```

## Output

### Archivo generado: `components/{variant}/{ComponentName}.tsx`

```typescript
import { type FC } from 'react';
import { motion } from 'framer-motion'; // si --with-animation
import { cn } from '@/lib/utils';

interface {ComponentName}Props {
  className?: string;
  children?: React.ReactNode;
}

export const {ComponentName}: FC<{ComponentName}Props> = ({
  className,
  children,
}) => {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
};

{ComponentName}.displayName = '{ComponentName}';
```

### Si `--with-test`: `components/{variant}/{ComponentName}.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { {ComponentName} } from './{ComponentName}';

describe('{ComponentName}', () => {
  it('renders correctly', () => {
    render(<{ComponentName}>Test</{ComponentName}>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Si `--with-animation`: Incluye config de Framer Motion

```typescript
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.05 },
};

<motion.div
  variants={variants}
  initial="hidden"
  animate="visible"
  whileHover="hover"
>
  {/* content */}
</motion.div>
```

## Prompt Interno

Cuando el usuario ejecuta `/new-component`, realizo:

1. **Parsear argumentos**: Extraer nombre y opciones
2. **Determinar ubicación**: Según `--variant` o inferir del nombre
3. **Generar componente base** con:
   - Props interface
   - Export nombrado
   - displayName
   - Estilos básicos Cuphead (si es ui)
4. **Agregar features opcionales**:
   - Animaciones si `--with-animation`
   - Test si `--with-test`
   - Story si `--with-story`
5. **Crear archivo(s)**
6. **Mostrar resumen** de archivos creados

## Convenciones Aplicadas

- **Naming**: PascalCase para componentes
- **Props**: Siempre interface `{Name}Props`
- **Export**: Named export preferido
- **Styles**: TailwindCSS con utility `cn()`
- **Tipos**: TypeScript estricto
- **Display name**: Siempre incluir para debugging

## Estilos Cuphead Base (para --variant=ui)

```typescript
// Ejemplo de Button
const baseStyles = cn(
  'px-6 py-3 font-heading',
  'border-4 border-vintage-black rounded-lg',
  'shadow-vintage transition-all',
  'hover:-translate-y-1 hover:shadow-vintage-hover'
);
```

## Notas

- Si el componente ya existe, preguntar si sobrescribir
- Si falta configuración (Framer Motion no instalado), avisar
- Sugerir imports necesarios
