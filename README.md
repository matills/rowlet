# 🎬 Owlist

Una aplicación de tracking de películas, series y anime con estética retro cartoon de los años 30, inspirada en Cuphead.

## 📖 Descripción

Owlist permite a los usuarios:
- 🎯 Trackear películas, series y anime que están viendo, vieron, pausaron o quieren ver
- 📝 Crear listas personalizadas colaborativas
- 🏆 Desbloquear logros según el contenido que consumen
- ⭐ Escribir reviews y comentarios
- 👥 Seguir otros usuarios y ver su actividad
- 🎨 Disfrutar de una UI única con estética vintage de los años 30

## 🚀 Quick Start

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta en Supabase
- API Key de TMDB

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/owlist.git
cd owlist

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales (ver sección de configuración abajo)

# Ejecutar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Configuración de API Keys

#### 1. Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto (tarda ~2 minutos)
3. Una vez creado, ve a **Settings → API**
4. Copia las siguientes credenciales a tu `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon/Public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key (⚠️ NUNCA expongas esto públicamente)
5. Ve a **SQL Editor** y ejecuta el schema:
   - Copia el contenido de `supabase/schema.sql`
   - Pégalo en el SQL Editor
   - Click en **Run** para crear todas las tablas
6. (Opcional) Genera los tipos TypeScript:
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
   ```

Para más detalles sobre el schema, consulta `supabase/README.md`

#### 2. TMDB API (Películas y Series)

1. Ve a [https://www.themoviedb.org](https://www.themoviedb.org) y crea una cuenta
2. Ve a **Settings → API**
3. Solicita una API key (requiere completar un formulario simple)
4. Una vez aprobada, copia tu **API Key (v3 auth)**
5. Agrégala a tu `.env.local`:
   ```
   TMDB_API_KEY=tu-api-key-aqui
   NEXT_PUBLIC_TMDB_API_KEY=tu-api-key-aqui
   ```

**Rate Limits:** 40 requests cada 10 segundos

#### 3. Jikan API (Anime/Manga)

Jikan es una API **gratuita y sin autenticación** que obtiene datos de MyAnimeList.

- ✅ **No necesitas API key**
- ⚠️ Rate limits: 60 requests/minuto, 3 requests/segundo
- 📖 Docs: [https://docs.api.jikan.moe/](https://docs.api.jikan.moe/)

La aplicación maneja automáticamente los rate limits con caché y throttling.

### Configuración Completa de `.env.local`

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# TMDB API
TMDB_API_KEY=tu-tmdb-api-key
NEXT_PUBLIC_TMDB_API_KEY=tu-tmdb-api-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Styling:** TailwindCSS, Framer Motion
- **Backend:** Next.js API Routes, Server Actions
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **APIs Externas:** TMDB (películas/series), Jikan (anime)
- **Deploy:** Vercel

## 📚 Documentación

### Para Desarrollo

- **[Roadmap](docs/ROADMAP.md)** - Plan de desarrollo completo por fases
- **[Guía de Agentes](docs/AGENTS_GUIDE.md)** - Cómo usar agentes y skills para desarrollo
- **[Agentes](.claude/agents/README.md)** - Documentación de agentes especializados
- **[Skills](.claude/skills/)** - Documentación de skills disponibles

### Agentes Disponibles

| Agente | Especialidad |
|--------|--------------|
| 🎨 **Frontend Agent** | UI/UX, React, Animaciones Cuphead |
| ⚙️ **Backend Agent** | APIs, Server Actions, Lógica de negocio |
| 🗄️ **Database Agent** | Supabase, Schemas, Queries SQL |
| 🔌 **API Integration Agent** | TMDB, Jikan, APIs externas |
| 🧪 **Testing Agent** | Tests, Debugging |
| 🚀 **DevOps Agent** | Deploy, CI/CD, Performance |

### Skills Disponibles

```bash
/new-component <name>        # Crear componente React
/new-api <route>             # Crear API endpoint
/tmdb-search <query>         # Buscar en TMDB
/jikan-search <query>        # Buscar anime/manga
/supabase-table <name>       # Crear tabla con RLS
```

## 🎨 Estética Cuphead

### Paleta de Colores

- **Sepia:** `#E8D5B7` - Color principal vintage
- **Cream:** `#F5E6D3` - Backgrounds claros
- **Vintage Black:** `#1A1A1A` - Texto y bordes
- **Vintage Red:** `#C1272D` - Acentos importantes
- **Vintage Yellow:** `#E9B44C` - Botones secundarios

### Características Visuales

- Bordes gruesos tipo cartoon (4px)
- Sombras paralelas estilo cel-shading
- Animaciones con "bounce" exagerado
- Efectos de papel envejecido
- Tipografías retro de los años 30

## 📝 Licencia

[MIT](LICENSE)

## 🙏 Agradecimientos

- Inspiración visual: [Cuphead](https://cupheadgame.com/)
- APIs: [TMDB](https://www.themoviedb.org/), [Jikan/MyAnimeList](https://jikan.moe/)
- Stack: [Next.js](https://nextjs.org/), [Supabase](https://supabase.com/)

---
