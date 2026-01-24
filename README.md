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
# Editar .env.local con tus credenciales

# Ejecutar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

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
