# Pre-launch Checklist

## Ya validado localmente

- [x] El proyecto ahora vive en la raíz correcta: `/Users/juja/Desktop/Entrepeneur/Baches mvd`
- [x] `.env.local` no está trackeado por git
- [x] `.env.local` no aparece en el historial git
- [x] `.gitignore` excluye `.env*` y permite versionar `.env.local.example`
- [x] No hay secretos hardcodeados en el repo; solo placeholders en `.env.local.example` y `README.md`
- [x] `npx tsc --noEmit` pasa limpio
- [x] `next/font/google` fue removido para evitar preload innecesario y builds más frágiles
- [x] La convención de `middleware` fue migrada a `proxy.ts`
- [x] `next.config.ts` usa `turbopack.root` correcto

## Pendiente en Supabase

- [ ] Ejecutar el SQL actualizado de `supabase/schema.sql`
- [ ] Confirmar que existe la tabla `report_votes`
- [ ] Confirmar que `reports` tiene:
  - [ ] `sent_confirmed_count`
  - [ ] `repair_confirmed_count`
  - [ ] `status_updated_at`
  - [ ] `sent_at`
  - [ ] `repaired_at`
- [ ] Confirmar que existe el bucket `report-photos`
- [ ] Confirmar que las fotos se suben correctamente
- [ ] Borrar reportes y fotos de prueba

## Pendiente en variables de entorno / hosting

- [ ] Configurar `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Configurar `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Configurar `SUPABASE_SERVICE_ROLE_KEY` solo del lado servidor
- [ ] Configurar `VOTE_FINGERPRINT_SALT` con un valor largo y único
- [ ] Rotar claves si alguna estuvo expuesta antes

## Pendiente de QA manual

- [ ] Crear reporte sin foto
- [ ] Crear reporte con foto
- [ ] Ver detalle del reporte
- [ ] Confirmar que el email no aparece públicamente
- [ ] Probar `Confirmar este bache`
- [ ] Probar `Ya hice la denuncia formal`
- [ ] Probar `Marcar como reparado`
- [ ] Verificar transición de estados
- [ ] Verificar que `reparado` se vea verde en el mapa
- [ ] Abrir y probar pantalla completa del mapa
- [ ] Confirmar ranking y botón `Nuevo reporte` dentro del fullscreen
- [ ] Probar mobile en el navegador y en celular real
- [ ] Probar PDF del reporte
- [ ] Probar PDF de guía de estados
- [ ] Probar links oficiales por departamento
- [ ] Revisar consola del navegador sin errores críticos

## Pendiente en GitHub

- [ ] Activar secret scanning
- [ ] Activar Dependabot
- [ ] Activar branch protection
- [ ] Revisar `README.md`
- [ ] Revisar `SECURITY.md`
- [ ] Decidir si el repo sale privado primero o directamente público

## Regla operativa para no volver a saturar la máquina

- [ ] No correr `npm run build` durante iteraciones normales
- [ ] Usar `npx tsc --noEmit` como validación liviana
- [ ] Mantener un solo `npm run dev` abierto a la vez
- [ ] Si Next se pone pesado: parar el server, borrar `.next`, volver a levantar
