// app/validators/rol.ts
import vine from '@vinejs/vine'
// No necesitas importar ValidationException aquí, ya que no la lanzarás directamente
// import { ValidationException } from '@vinejs/vine' // ¡ELIMINADO!

/**
 * 🟢 Validación para crear un nuevo rol
 */
export const crearRolValidator = vine.compile(
  vine.object({
    nombre: vine
      .string()
      .minLength(3)
      .maxLength(50)
      // La regla 'unique' espera un callback que retorna Promise<boolean>.
      // Si retorna 'false', indica que la validación falló (no es único).
      .unique(async (db, value) => {
        const rolExiste = await db.from('roles').where('nombre', value).first()
        if (rolExiste) {
          return false // 🔴 CORRECTO: Si el rol YA EXISTE, retorna FALSE.
                      // VineJS se encargará de generar el ValidationError con el mensaje adecuado.
        }
        return true // ✅ Si el rol NO EXISTE, es único, retorna TRUE.
      }),
    descripcion: vine.string().maxLength(255).optional(),
  })
)

/**
 * 🟡 Validación para actualizar un rol existente
 */
export const actualizarRolValidator = vine.compile(
  vine.object({
    nombre: vine
      .string()
      .minLength(3)
      .maxLength(50)
      .unique(async (db, value, field) => {
        const rolId = field.meta?.rolId as number | undefined

        const rolConMismoNombre = await db.from('roles').where('nombre', value).first()

        // Si se encontró un rol con el mismo nombre Y su ID es diferente al rol que estamos actualizando,
        // significa que otro rol ya está usando ese nombre.
        if (rolConMismoNombre && rolConMismoNombre.id !== rolId) {
          return false // 🔴 CORRECTO: Otro rol ya tiene este nombre, retorna FALSE.
                      // VineJS se encargará de generar el ValidationError.
        }
        return true // ✅ Es único (o es el mismo rol que estamos editando), retorna TRUE.
      })
      .optional(),
    descripcion: vine.string().maxLength(255).optional(),
    estado: vine.enum(['activo', 'inactivo']).optional(),
  })
)

export const rolValidator = {
  crear: crearRolValidator,
  actualizar: actualizarRolValidator,
}