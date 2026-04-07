# Security Policy

## Reporting a vulnerability

Si encontrás una vulnerabilidad o una exposición de datos:

1. No abras un issue público con detalles explotables.
2. Contactá al mantenedor por un canal privado.
3. Incluí pasos para reproducir, impacto y alcance estimado.

## Scope

Este proyecto intenta minimizar exposición de datos:

- los emails no se devuelven en endpoints públicos
- la subida de fotos usa una ruta servidor
- la clave `SUPABASE_SERVICE_ROLE_KEY` nunca debe exponerse al cliente

## Secrets

Nunca subas al repositorio:

- `.env.local`
- service role keys
- tokens privados
- credenciales de terceros

## Operational recommendations

- activar secret scanning en GitHub
- activar branch protection
- revisar dependencias periódicamente
- rotar claves si alguna vez se expusieron
