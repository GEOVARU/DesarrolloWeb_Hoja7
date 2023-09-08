const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();

// Configurar el cuerpo de solicitud JSON
app.use(bodyParser.json());

// Conectar a la base de datos MongoDB
mongoose.connect('mongodb://localhost/tu_basededatos', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Definir el modelo de usuario
const User = mongoose.model('User', {
  usuario: String,
  clave: String,
});

// Ruta para el inicio de sesión (POST)
app.post('/proyecto/login/:DPI', async (req, res) => {
  const { usuario, clave } = req.body;
  const DPI = req.params.DPI;

  try {
    // Verificar las credenciales del usuario
    const user = await User.findOne({ usuario, clave }).exec();
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar un token JWT
    const token = jwt.sign({ usuario, DPI }, 'secreto', { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Middleware para verificar el token
function verificarToken(req, res, next) {
  const token = req.headers.token;
  if (!token) {
    return res.status(403).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, 'secreto', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    req.user = decoded;
    next();
  });
}

// Ruta protegida para obtener datos (GET)
app.get('/proyecto/data', verificarToken, (req, res) => {
  const { usuario, DPI } = req.user;
  res.json({ usuario, DPI });
});

// Iniciar el servidor en el puerto 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor en ejecución en el puerto ${port}`);
});
