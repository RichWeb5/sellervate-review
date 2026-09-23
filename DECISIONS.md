# Decisiones

## Producto

Marta sabe juzgar una respuesta, pero su criterio no queda registrado en ningún sitio. Sin ese registro no puede enseñarle la tendencia a una marca ni preparar ejemplos para alguien nuevo. Por eso lo leí como un problema de revisión. Si revisar es rápido y consistente, la tendencia y la formación salen solas de esos mismos datos.

Lo primero que construí fue la cola con las respuestas de ayer, donde la app sugiere cinco repartidas entre los especialistas que menos se han revisado. Al abrir una, Marta ve el mensaje del cliente, la respuesta y los procedimientos de la marca juntos, pone una nota del 1 al 5 con el teclado y marca qué falló. Los fallos tienen severidad, porque decir algo falso sobre un producto es mucho más grave que equivocarse en el tono. Después hice la vista del especialista, donde cada uno ve solo sus reviews y puede marcarlas como leídas, y un reporte por marca con la nota de cada semana y los fallos que más se repiten.

Dejé fuera la biblioteca de formación, porque las reviews con nota 5 ya son esa biblioteca. Tampoco importé nada del helpdesk, aunque la tabla de conversaciones ya guarda el origen y el identificador externo para hacerlo más adelante. Editar la rúbrica, la zona horaria de cada marca y una vista global para dirección quedaron para después.

Usaría un modelo para ordenar la cola, de forma que Marta lea primero las respuestas que probablemente están mal. Antes tendría que medirse contra sus propias reviews, y solo ordenaría, nunca pondría notas. No lo usaría para puntuar, porque el criterio de Marta es justamente el producto.

Antes de una V2 preguntaría quién necesita ver todas las marcas a la vez, si la marca verá el reporte directamente y cuántas reviews por especialista a la semana consideran suficientes.

## Arquitectura

Es un monorepo con la app de Next.js y Supabase. Todo lo que toca datos pasa por el servidor y el navegador nunca habla directamente con la base de datos.

Las marcas son los tenants y el rol depende de la marca, así que alguien puede liderar una y escribir para otra. Las respuestas no se pueden editar porque ya se enviaron, y los criterios se archivan en vez de borrarse para que las reviews antiguas sigan teniendo sentido. Cada review se guarda junto con sus fallos en una sola transacción.

Los permisos viven en Postgres, con RLS en todas las tablas. La app consulta siempre como el usuario que inició sesión y nunca con la clave de administrador, así que aunque alguien llame a la API directamente no puede ver datos de otra marca. Lo comprueban 18 pruebas en la base de datos y un script que pide datos ajenos a la API y espera que se los niegue.

Para tener un login real bastaría con cambiar el selector de usuario por un enlace mágico o por Google con Supabase Auth. Las reglas de acceso no cambiarían.

Lo primero que se rompería al crecer es el reporte, que hace los cálculos en la app y con mucho volumen debería hacerlos SQL. También habría que dejar de usar UTC para los días y paginar la cola.

## IA

Claude Code escribió el código en base a mis indicaciones. Yo decidí el enfoque y probé cada pantalla en el navegador antes de aceptar los cambios.

Acertó con el modelo de datos, las reglas de acceso y sus pruebas, y con unos datos de ejemplo. Tuve que corregirlo en la navegación por días, que te llevaba a días vacíos y ahora es un desplegable, en el botón para volver a la cola, en un texto que prometía algo que todavía no existía y en unas descripciones de PR demasiado largas.

Lo que más ayudó a obtener un buen resultado fue fijar las reglas del código en CLAUDE.md desde el principio, trabajar en PRs pequeños y probar cada pantalla yo mismo antes de aceptarla.

Este es un prompt del que estoy contento.

> "antes de seguir previous day y next day no funciona, también next day se desactiva cuando estamos en él pero en previous day no; además debemos mantener la página web amigable, fácil de usar y entendible"

## Estado

Están terminados la cola, la revisión, la vista del especialista, el reporte de marca y el aislamiento entre marcas con sus pruebas. Queda a medias el manejo de algunos errores, que muestran un mensaje genérico, aunque solo pasa si alguien fabrica la petición a mano. No toqué la biblioteca de formación, el importador del helpdesk, el login real ni la edición de la rúbrica, y los retomaría en ese orden.

Lo primero que testearía es la lógica que elige las cinco sugeridas. Preferí dedicar ese tiempo al aislamiento entre marcas, que era más importante.

Si esto llegara como el PR de otra persona, lo que más marcaría es que el reporte trae todas las reviews de seis semanas y calcula en la app. Con mucho volumen sería lento y debería ser una consulta SQL. Lo dejé así porque con estos datos es instantáneo y moverlo no cambia nada de lo que ve Marta.
