# Backend API - Organizador de Torneos Multijuego

Servidor API REST desarrollado en Node.js y Express para gestionar Jugadores, Equipos Fijos, Juegos y Torneos Multijuego.

## 🚀 Despliegue Gratuito en Render.com

Para tener una URL pública HTTPS gratis para este backend (ej: `https://mi-torneo-api.onrender.com`):

1. **Crear Repositorio en GitHub:**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend commit"
   # Vincula a tu nuevo repositorio en GitHub
   git remote add origin https://github.com/TU_USUARIO/tu-backend.git
   git push -u origin main
   ```

2. **Desplegar en Render:**
   - Ve a [Render.com](https://render.com) e inicia sesión gratis con GitHub.
   - Haz clic en **New +** -> **Web Service**.
   - Conecta tu repositorio de GitHub `tu-backend`.
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - Haz clic en **Create Web Service**.

Render te dará una URL pública gratuita HTTPS al instante. Guarda esa URL para conectarla con el Frontend en Netlify.
