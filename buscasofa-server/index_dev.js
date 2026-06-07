const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const {
    secret,
    hostname_dev_out,
    hostname_dev_lan
} = require("./secret");

const app = express();
app.use(express.json());
const allowedOrigins = new Set([
    hostname_dev_out,
    hostname_dev_lan,
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
})); // Algo de seguridad

// Inicializa la base de datos SQLite
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error('Error al abrir la base de datos:', err.message);
    else {
        console.log('Conectado a la base de datos SQLite');
        console.log('Creando la tabla de usuarios si no existe...');
        db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('Creando la tabla de comentarios si no existe...');
        db.run(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        station_id TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        username TEXT NOT NULL,
        comment TEXT NOT NULL,
        rating INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
            if (err) {
                console.error('Error creando tabla comments:', err.message);
                return;
            }
            db.all('PRAGMA table_info(comments)', [], (err, columns) => {
                if (err) {
                    console.error('Error comprobando columnas de comments:', err.message);
                    return;
                }
                const hasRating = columns.some((col) => col.name === 'rating');
                if (!hasRating) {
                    db.run('ALTER TABLE comments ADD COLUMN rating INTEGER', (err) => {
                        if (err) console.error('Error agregando columna rating a comments:', err.message);
                        else console.log('Columna rating añadida a la tabla comments');
                    });
                }
            });
        });
        console.log('Finalizada la conexión con la base de datos SQLite :)');
    }
});

// Registro de usuario
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });

    db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], async (err, row) => {
        if (row) return res.status(409).json({ message: 'Usuario o email ya existe' });

        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            function (err) {
                if (err) return res.status(500).json({ message: 'Error en el servidor', error: err.message });
                res.status(201).json({ message: 'Usuario registrado correctamente' });
            }
        );
    });
});

// Login de usuario
app.post('/api/login', (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password)
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    
    db.get('SELECT * FROM users WHERE email = ? OR username = ?', [identifier, identifier], async (err, user) => { // Modificado para aceptar email o nombre de usuario
        if (err) return res.status(500).json({ message: 'Error del servidor' });

        if (!user) return res.status(401).json({ message: 'Ningún usuario registrado con ese email o nombre' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Credenciales incorrectas' });

        const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: '1h' });
        res.json({ message: 'Login correcto', token, username: user.username, email: user.email });
    });
});

function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"
    if (!token) return res.status(401).json({ message: 'Token requerido' });

    try {
        req.user = jwt.verify(token, secret);
        next();
    } catch {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
}

// Añadir comentario
app.post('/api/comments', requireAuth, (req, res) => {
    const { station_id, comment, rating } = req.body;

    if (!station_id || !comment) return res.status(400).json({ message: 'Datos incompletos' });

    const parsedRating = rating == null ? null : Number(rating);
    if (rating != null && (Number.isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5)) {
        return res.status(400).json({ message: 'Rating inválido. Debe ser un número entre 0 y 5.' });
    }

    db.run(
        'INSERT INTO comments (station_id, user_id, username, comment, rating) VALUES (?, ?, ?, ?, ?)',
        [station_id, req.user.id, req.user.username, comment, parsedRating],
        function (err) {
            if (err) return res.status(500).json({ message: 'Error al guardar comentario', error: err.message });
            res.status(201).json({ message: 'Comentario guardado' });
        }
    );
});

// Obtener comentarios de una estación
app.get('/api/comments/:station_id', (req, res) => {
    db.all(
        'SELECT username, comment, rating, created_at FROM comments WHERE station_id = ? ORDER BY created_at DESC',
        [req.params.station_id],
        (err, rows) => {
            if (err) return res.status(500).json({ message: 'Error al obtener comentarios', error: err.message });
            res.json(rows);
        }
    );
});

app.get('/api/comments/user/:username', (req, res) => {
    db.all(
        'SELECT comment, rating, created_at, station_id FROM comments WHERE username = ? ORDER BY created_at DESC',
        [req.params.username],
        (err, rows) => {
            if (err) return res.status(500).json({ message: 'Error al obtener tus comentarios', error: err.message });
            res.json(rows);
        }
    );
});

app.post('/api/user/update', requireAuth, (req, res) => { // Camnbio de username, email o pass
    const { field, newValue, currentPassword } = req.body;

    if (!['username', 'email', 'password'].includes(field))
        return res.status(400).json({ message: 'Campo inválido' });
    if (!newValue || !currentPassword)
        return res.status(400).json({ message: 'Datos incompletos' });

    db.get('SELECT * FROM users WHERE id = ?', [req.user.id], async (err, user) => {
        if (err || !user) return res.status(500).json({ message: 'Usuario no encontrado' });

        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) return res.status(401).json({ message: 'Contraseña actual incorrecta' });

        const valueToStore = field === 'password' ? await bcrypt.hash(newValue, 10) : newValue;

        db.run(`UPDATE users SET ${field} = ? WHERE id = ?`, [valueToStore, req.user.id], function (err) {
            if (err) return res.status(500).json({ message: 'Error al actualizar', error: err.message });

            db.get('SELECT username, email FROM users WHERE id = ?', [req.user.id], (err, updated) => {
                if (err) return res.status(500).json({ message: 'Error al obtener usuario actualizado' });
                res.json({ message: 'Actualizado correctamente', user: updated });
            });
        });
    });
});

app.listen(4000, () => console.log('Servidor backend (SQLite) en http://localhost:4000'));