# Actividad Grupal
IMPORTANTE:
Para empezar a hacer cosas, leer `TODO.md` POR FAVOR
## Tests:
|Nombre|Lo pasa|
|-|-:|
|features.header| Sí |
|features.notfound| Sí |
|features.users| Sí |
|fuel_prices| Sí |
|header| Sí |
|home| Sí |
|profile&comments| Sí |
|components.About| Sí |
|components.Footer| Sí |

## Para usar fuera de lan
1. En `buscasofa/` crear: 

```text
# buscasofa/.env
VITE_API_URL=y pones aqui la url
```
2. En `buscasofa-server`:
```text
// buscasofa-server/secrets.js

module.exports = {
  secret: "la clave de seguridad del server",
  port_server: "4000",
  port_app: "5173",
  hostname_dev_out: `tu link fuera de lan`,
  hostname_dev_lan: `http://localhost:5173`,
};
```

## Usuario de prueba
<details>
  <summary>(clic para revelar)</summary>

```text
Nombre de usuario: test
Correo electrónico: test@test.test
Contraseña: test
```
</details>

## Iniciando buscasofa-server
Creación de la tabla de usuarios en mySQL (para despliegue)

```sql
CREATE DATABASE IF NOT EXISTS gasolineras;
USE gasolineras;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Para instalar las dependencias: 

```
npm install
```

Para lanzar el servidor de desarrollo:

```
npm run dev
```

o 

```
node index_dev.js
```
## React + Vite

Ejecutar la aplicación

`npm run dev`

Pruebas, abrir cypress

`npx cypress open`

Para que funcionen las pruebas con usuarios hay que tener ejecutando el servidor:

https://github.com/luispedraza/buscasofa-server 




Recursos útiles
===============

Documentación de vite: https://vite.dev/guide/ 
Documentación de cypress: https://www.cypress.io/ 
cypress-cucumber-preprocessor: https://github.com/badeball/cypress-cucumber-preprocessor?tab=readme-ov-file 

Otros: 

Tutorial Cypress + React: https://www.youtube.com/watch?v=6BkcHAEWeTU
Explica cómo instalar cypress en una aplicación react y escribir un test para probar una aplicación sencilla 

Tutorial cypress + cucumber --> react https://www.youtube.com/playlist?list=PLyWVU-yS4Fb7UcKP8ElLsZklMO86vLdHQ 

Mocking en cypress https://kailash-pathak.medium.com/mocking-api-response-in-cypress-a73dea514cfd 