# baches.uy

Mapa colaborativo para reportar baches en Uruguay, visibilizar el problema y facilitar presión pública con datos.

## Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Supabase
- Leaflet

## Variables de entorno

Copiá [`.env.local.example`](/Users/juja/Desktop/Entrepeneur/Baches%20mvd/.env.local.example) a `.env.local` y completá:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
SUPABASE_SERVICE_ROLE_KEY=
VOTE_FINGERPRINT_SALT=
```

Notas:

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` pueden usarse en el cliente.
- `NEXT_PUBLIC_SITE_URL` define el dominio público usado en compartir links, PDFs y acciones cívicas.
- `SUPABASE_SERVICE_ROLE_KEY` es secreta y solo debe existir en el servidor o en el hosting.
- `VOTE_FINGERPRINT_SALT` se usa para hashear la huella de voto sin guardar IP o user-agent en claro.
- Nunca subas `.env.local` al repositorio.

## Desarrollo

```bash
npm install
npm run dev
```

Si Next queda con caché vieja:

```bash
rm -rf .next
npm run dev
```

## Producción

Antes de desplegar:

1. Configurá las 3 variables de entorno en tu hosting.
2. Confirmá que el bucket `report-photos` exista en Supabase.
3. Revisá las políticas RLS de `reports`.
4. Ejecutá el `supabase/schema.sql` actualizado para crear `report_votes` y las nuevas columnas de estado.
5. Probá creación de reportes, subida de fotos y votos de confirmación / denuncia formal / reparación.

## Datos sensibles

- Los emails se almacenan en Supabase pero no se exponen en lecturas públicas.
- Las mutaciones sensibles pasan por endpoints del servidor con validación, CSRF y rate limiting básico.
- La `SUPABASE_SERVICE_ROLE_KEY` no debe exponerse al frontend ni a logs.

## Borrar reportes de prueba

No hay endpoint público para borrar reportes.

Hacelo desde Supabase:

- Table Editor > `reports`
- o con SQL:

```sql
delete from reports where id = '...';
```

Si el reporte tiene fotos, borrá también los objetos del bucket `report-photos`.
