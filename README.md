# bachesuy.com

![Logo de bachesuy.com](public/baches-wordmark.png)

Mapa colaborativo para reportar baches en Uruguay, visibilizar el problema y generar presión pública con datos, fotos y evidencia compartible.

## Qué hace

- Permite reportar baches con ubicación, fotos y descripción.
- Muestra los reportes en un mapa público con clustering visual.
- Permite confirmar reportes, marcar denuncias formales y registrar reparaciones.
- Genera constancias PDF y links para compartir en redes o mensajería.
- Centraliza canales oficiales de reclamo por departamento.

## Por qué es útil

El proyecto busca transformar un problema cotidiano en evidencia pública fácil de compartir. La idea no es reemplazar los canales oficiales, sino facilitar que más personas visibilicen el problema, documenten casos y generen presión cívica con datos.

## Cómo empezar

### Requisitos

- Node.js 22
- npm
- Un proyecto de Supabase

La versión recomendada de Node está definida en [`.nvmrc`](.nvmrc).

### Instalación

```bash
npm install
```

### Variables de entorno

Copiá [`.env.local.example`](.env.local.example) a `.env.local` y completá:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
SUPABASE_SERVICE_ROLE_KEY=
VOTE_FINGERPRINT_SALT=
```

Notas:

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` son públicas.
- `NEXT_PUBLIC_SITE_URL` define el dominio usado en links compartidos, PDFs y metadatos.
- `SUPABASE_SERVICE_ROLE_KEY` es privada y solo debe vivir en el servidor o en el hosting.
- `VOTE_FINGERPRINT_SALT` se usa para hashear la huella de voto sin guardar IP o user-agent en claro.
- Nunca subas `.env.local` al repositorio.

### Base de datos

El proyecto usa Supabase para persistencia, fotos y lógica de votos.

Antes de usar el sistema completo, ejecutá el schema de [Supabase](supabase/schema.sql) y confirmá que exista el bucket `report-photos`.

### Desarrollo local

Modo recomendado:

```bash
npm run dev:stable
```

Ese script usa Webpack en vez de Turbopack, que en este proyecto resultó más estable para desarrollo local.

Si necesitas limpiar caché de Next:

```bash
rm -rf .next
npm run dev:stable
```

## Deploy

Para desplegar en Vercel:

1. Importá el repositorio.
2. Cargá las variables de entorno reales en el panel del proyecto.
3. Configurá `NEXT_PUBLIC_SITE_URL` con el dominio final.
4. Redeployá.

Antes de lanzar públicamente, conviene revisar la checklist de [pre-launch](PRELAUNCH_CHECKLIST.md).

## Seguridad y datos sensibles

- Los emails se almacenan en Supabase pero no se exponen en lecturas públicas.
- Las mutaciones sensibles pasan por endpoints del servidor con validación, CSRF y rate limiting básico.
- `SUPABASE_SERVICE_ROLE_KEY` nunca debe exponerse al frontend ni al repositorio.

Más detalles en [SECURITY.md](SECURITY.md).

## Dónde pedir ayuda

- Si encuentras un bug o quieres proponer una mejora, abre un issue en GitHub.
- Si detectas un problema de seguridad, sigue las indicaciones de [SECURITY.md](SECURITY.md).

## Mantenimiento

Proyecto mantenido actualmente por Juan José Rodríguez. Las contribuciones, ideas y mejoras son bienvenidas.
