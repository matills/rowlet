# Skill: /supabase-table

## Descripción
Genera SQL para crear tabla en Supabase con RLS policies, tipos TypeScript, y queries de ejemplo.

## Uso

```bash
/supabase-table <table-name> [opciones]
```

### Opciones
- `--with-rls`: Incluir Row Level Security policies (default: true)
- `--with-types`: Generar tipos TypeScript (default: true)
- `--with-triggers`: Incluir triggers (updated_at, etc.)
- `--soft-delete`: Agregar columna deleted_at para soft deletes

### Ejemplos

```bash
/supabase-table achievements --with-rls
/supabase-table list_collaborators --with-triggers
/supabase-table reviews --soft-delete
```

## Output

### 1. SQL Migration

```sql
-- ============================================
-- Table: achievements
-- Description: Store user achievements/badges
-- Created: 2026-01-24
-- ============================================

-- Create table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  threshold INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_achievements_code ON achievements(code);
CREATE INDEX idx_achievements_category ON achievements(category);

-- Add comments
COMMENT ON TABLE achievements IS 'Stores achievement definitions';
COMMENT ON COLUMN achievements.code IS 'Unique achievement code identifier';
COMMENT ON COLUMN achievements.threshold IS 'Required value to unlock (for numeric achievements)';

-- Enable Row Level Security
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can read achievements
CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (true);

-- Only admins can insert/update/delete achievements
CREATE POLICY "Only admins can modify achievements"
  ON achievements FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Trigger for updated_at (si --with-triggers)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_achievements_updated_at
  BEFORE UPDATE ON achievements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. Rollback Migration

```sql
-- Rollback migration for achievements table

DROP TRIGGER IF EXISTS update_achievements_updated_at ON achievements;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON achievements;
DROP POLICY IF EXISTS "Only admins can modify achievements" ON achievements;
DROP TABLE IF EXISTS achievements CASCADE;
```

### 3. TypeScript Types

```typescript
// types/database/achievements.ts

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string | null;
  category: AchievementCategory;
  threshold: number | null;
  created_at: string;
  updated_at: string;
}

export type AchievementCategory = 'QUANTITY' | 'GENRE' | 'STREAK' | 'THEMATIC';

export interface AchievementInsert {
  code: string;
  name: string;
  description: string;
  icon?: string;
  category: AchievementCategory;
  threshold?: number;
}

export interface AchievementUpdate {
  name?: string;
  description?: string;
  icon?: string;
  category?: AchievementCategory;
  threshold?: number;
}

// Supabase Database type
export interface Database {
  public: {
    Tables: {
      achievements: {
        Row: Achievement;
        Insert: AchievementInsert;
        Update: AchievementUpdate;
      };
    };
  };
}
```

### 4. Query Examples

```typescript
// lib/supabase/achievements.ts

import { createClient } from '@/lib/supabase/server';
import type { Achievement, AchievementInsert } from '@/types/database/achievements';

// Get all achievements
export async function getAllAchievements(): Promise<Achievement[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('category', { ascending: true })
    .order('threshold', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data;
}

// Get achievements by category
export async function getAchievementsByCategory(
  category: AchievementCategory
): Promise<Achievement[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('category', category)
    .order('threshold', { ascending: true });

  if (error) throw error;
  return data;
}

// Get achievement by code
export async function getAchievementByCode(
  code: string
): Promise<Achievement | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('code', code)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data;
}

// Create achievement (admin only)
export async function createAchievement(
  achievement: AchievementInsert
): Promise<Achievement> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('achievements')
    .insert(achievement)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update achievement (admin only)
export async function updateAchievement(
  id: string,
  updates: AchievementUpdate
): Promise<Achievement> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('achievements')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete achievement (admin only)
export async function deleteAchievement(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('achievements')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
```

## Prompt Interno

Cuando el usuario ejecuta `/supabase-table`, realizo:

1. **Inferir estructura** de la tabla según el nombre y contexto de Owlist
2. **Determinar columnas** apropiadas
3. **Generar SQL** con:
   - CREATE TABLE con tipos correctos
   - Índices relevantes
   - Comentarios descriptivos
   - Foreign keys si aplica
4. **Crear RLS policies** apropiadas según el tipo de tabla
5. **Generar tipos TypeScript** completos
6. **Crear queries de ejemplo** comunes
7. **Incluir rollback script**

## Plantillas por Tipo de Tabla

### User-owned Resource (lists, reviews)

```sql
-- RLS: Users can only see/modify their own records
CREATE POLICY "Users can view own records"
  ON {table} FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records"
  ON {table} FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records"
  ON {table} FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own records"
  ON {table} FOR DELETE
  USING (auth.uid() = user_id);
```

### Public Read, Owner Write (user profiles)

```sql
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Collaborative Resource (list_collaborators)

```sql
CREATE POLICY "View if owner or collaborator"
  ON list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_items.list_id
      AND (
        lists.user_id = auth.uid()
        OR lists.is_public = true
        OR EXISTS (
          SELECT 1 FROM list_collaborators
          WHERE list_collaborators.list_id = lists.id
          AND list_collaborators.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Modify if owner or editor"
  ON list_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_items.list_id
      AND (
        lists.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM list_collaborators
          WHERE list_collaborators.list_id = lists.id
          AND list_collaborators.user_id = auth.uid()
          AND list_collaborators.permission = 'EDIT'
        )
      )
    )
  );
```

### Public Read-Only (achievements, content)

```sql
CREATE POLICY "Public read access"
  ON {table} FOR SELECT
  USING (true);

CREATE POLICY "Admin only write"
  ON {table} FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

## Tipos de Columnas Comunes

```sql
-- IDs
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- Foreign Keys
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
list_id UUID REFERENCES lists(id) ON DELETE CASCADE

-- Strings
name VARCHAR(100) NOT NULL
code VARCHAR(50) UNIQUE NOT NULL
email VARCHAR(255) UNIQUE NOT NULL
description TEXT

-- Numbers
rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10)
count INTEGER DEFAULT 0
threshold INTEGER

-- Booleans
is_public BOOLEAN DEFAULT false
has_spoilers BOOLEAN DEFAULT false

-- Enums (usar CHECK constraint o tabla separada)
type VARCHAR(20) CHECK (type IN ('MOVIE', 'SERIES', 'ANIME'))

-- Timestamps
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
deleted_at TIMESTAMPTZ -- Soft delete

-- Arrays
genres TEXT[]
tags TEXT[]

-- JSON
metadata JSONB
```

## Índices Recomendados

```sql
-- Foreign keys (siempre)
CREATE INDEX idx_{table}_user_id ON {table}(user_id);
CREATE INDEX idx_{table}_list_id ON {table}(list_id);

-- Columnas usadas en WHERE frecuentemente
CREATE INDEX idx_{table}_status ON {table}(status);
CREATE INDEX idx_{table}_type ON {table}(type);

-- Columnas usadas en ORDER BY
CREATE INDEX idx_{table}_created_at ON {table}(created_at DESC);

-- Unique constraints que necesitan búsqueda rápida
CREATE UNIQUE INDEX idx_{table}_code ON {table}(code);

-- Composite indexes para queries comunes
CREATE INDEX idx_{table}_user_created ON {table}(user_id, created_at DESC);

-- Partial indexes para casos específicos
CREATE INDEX idx_{table}_active ON {table}(id) WHERE deleted_at IS NULL;
```

## Triggers Útiles

### Updated_at auto-update

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_{table}_updated_at
  BEFORE UPDATE ON {table}
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Audit log

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, user_id)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Soft Delete Implementation

```sql
-- Agregar columna
ALTER TABLE {table} ADD COLUMN deleted_at TIMESTAMPTZ;

-- Índice para queries de "activos"
CREATE INDEX idx_{table}_not_deleted ON {table}(id) WHERE deleted_at IS NULL;

-- Función de soft delete
CREATE OR REPLACE FUNCTION soft_delete_{table}(record_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE {table}
  SET deleted_at = NOW()
  WHERE id = record_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Modificar RLS para excluir deleted
CREATE POLICY "Users view own non-deleted"
  ON {table} FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
```

## Notas

- Siempre incluir `created_at` y `updated_at`
- Usar UUID para IDs (más seguro que SERIAL)
- Habilitar RLS en TODAS las tablas de usuario
- Agregar comentarios descriptivos
- Crear índices en foreign keys
- Considerar soft deletes para datos importantes
- Usar CASCADE cuidadosamente en foreign keys
