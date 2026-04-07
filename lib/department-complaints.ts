import type { DepartmentComplaintChannel } from '@/types'

export const DEPARTMENT_COMPLAINT_CHANNELS: DepartmentComplaintChannel[] = [
  {
    department: 'Montevideo',
    url: 'https://tramites.montevideo.gub.uy/aplicacion/buzon-ciudadano',
    label: 'Buzón Ciudadano',
    kind: 'complaint_form',
  },
  {
    department: 'Artigas',
    url: 'https://www.artigas.gub.uy/',
    label: 'Sitio oficial de la Intendencia',
    kind: 'official_contact',
  },
  {
    department: 'Canelones',
    url: 'https://canelonesteescucha.com.uy/',
    label: 'Canelones te escucha',
    kind: 'complaint_form',
  },
  {
    department: 'Cerro Largo',
    url: 'https://www.gub.uy/intendencia-cerro-largo/institucional/contacto',
    label: 'Contacto oficial',
    kind: 'official_contact',
  },
  {
    department: 'Colonia',
    url: 'https://www.colonia.gub.uy/',
    label: 'Portal oficial de la Intendencia',
    kind: 'official_contact',
  },
  {
    department: 'Durazno',
    url: 'https://durazno.uy/',
    label: 'Portal oficial del Gobierno de Durazno',
    kind: 'official_contact',
  },
  {
    department: 'Flores',
    url: 'https://www.flores.gub.uy/',
    label: 'Atención ciudadana',
    kind: 'official_contact',
  },
  {
    department: 'Florida',
    url: 'https://www.gub.uy/intendencia-florida/institucional/contacto',
    label: 'Formulario de contacto',
    kind: 'official_contact',
  },
  {
    department: 'Lavalleja',
    url: 'https://www.gub.uy/intendencia-lavalleja/institucional/contacto',
    label: 'Formulario de contacto',
    kind: 'official_contact',
  },
  {
    department: 'Maldonado',
    url: 'https://www.maldonado.gub.uy/',
    label: 'Guía de trámites y formularios',
    kind: 'official_contact',
  },
  {
    department: 'Paysandú',
    url: 'https://www.gub.uy/tramites/consultas-varias-paysandu',
    label: 'Consultas varias',
    kind: 'official_contact',
  },
  {
    department: 'Río Negro',
    url: 'https://www.rionegro.gub.uy/contactenos/',
    label: 'Contáctenos',
    kind: 'official_contact',
  },
  {
    department: 'Rivera',
    url: 'https://www.rivera.gub.uy/portal/',
    label: 'Portal oficial de la Intendencia',
    kind: 'official_contact',
  },
  {
    department: 'Rocha',
    url: 'https://www.rocha.gub.uy/portal/',
    label: 'Portal oficial y teléfonos de interés',
    kind: 'official_contact',
  },
  {
    department: 'Salto',
    url: 'https://www.salto.gub.uy/servicios/reclamos-y-solicitudes',
    label: 'Reclamos y solicitudes',
    kind: 'complaint_form',
  },
  {
    department: 'San José',
    url: 'https://sanjose.gub.uy/',
    label: 'Portal oficial de la Intendencia',
    kind: 'official_contact',
  },
  {
    department: 'Soriano',
    url: 'https://soriano.gub.uy/',
    label: 'Portal oficial y contacto',
    kind: 'official_contact',
  },
  {
    department: 'Tacuarembó',
    url: 'https://tacuarembo.gub.uy/web/',
    label: 'Portal oficial y trámites',
    kind: 'official_contact',
  },
  {
    department: 'Treinta y Tres',
    url: 'https://treintaytres.gub.uy/',
    label: 'Portal oficial y atención ciudadana',
    kind: 'official_contact',
  },
]

export function getDepartmentComplaintChannel(department: string) {
  const normalized = department.trim().toLowerCase()
  return DEPARTMENT_COMPLAINT_CHANNELS.find(
    (channel) => channel.department.trim().toLowerCase() === normalized
  ) ?? null
}
