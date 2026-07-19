import Image from 'next/image'
import Link from 'next/link'

import { deleteImageAction } from '@/app/admin/imagenes/actions'
import { UploadImage } from '@/components/admin/UploadImage'
import { requireAdmin } from '@/lib/auth/require'
import { db } from '@/lib/db'
import { imageUrl } from '@/lib/uploads'

export default async function ImagenesPage() {
  await requireAdmin()

  const uploads = await db.upload.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      filename: true,
      bytes: true,
      createdAt: true,
      _count: { select: { coverOf: true } },
    },
  })

  return (
    <main className="mx-auto max-w-4xl p-8">
      <Link href="/admin" className="text-sm text-brand-600 hover:underline">
        ← Panel
      </Link>
      <h1 className="mb-1 mt-2 text-2xl font-bold text-navy-900">Imágenes</h1>
      <p className="mb-6 text-muted-600">
        Sube aquí las portadas de tus talleres y las gráficas de tus preguntas.
      </p>

      <UploadImage />

      <h2 className="mb-3 mt-8 font-semibold text-navy-900">
        Tus imágenes {uploads.length > 0 && <span className="text-muted-600">({uploads.length})</span>}
      </h2>

      {uploads.length === 0 ? (
        <p className="rounded-card bg-card p-6 text-center text-muted-600">
          Todavía no has subido ninguna.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {uploads.map((u) => (
            <li key={u.id} className="overflow-hidden rounded-card bg-card shadow-sm">
              <a href={imageUrl(u.id)} target="_blank" rel="noreferrer" className="block bg-canvas">
                <Image
                  src={imageUrl(u.id)}
                  alt={u.filename}
                  width={400}
                  height={240}
                  className="h-40 w-full object-contain"
                />
              </a>

              <div className="p-3">
                <p className="truncate font-mono text-sm font-semibold text-navy-900" title={u.filename}>
                  {u.filename}
                </p>
                <p className="text-xs text-muted-600">
                  {Math.round(u.bytes / 1024)} KB
                  {u._count.coverOf > 0 && ` · portada de ${u._count.coverOf}`}
                </p>

                <form action={deleteImageAction} className="mt-2">
                  <input type="hidden" name="id" value={u.id} />
                  <button className="text-xs text-danger hover:underline">Borrar</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
