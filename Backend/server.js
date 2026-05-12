const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'laloplay',
  host: 'localhost',
  database: 'eventrent',
  password: '', // Tu contraseña de Postgres si la tiene
  port: 5432,
});

pool.on('connect', (client) => {
  client.query("SET timezone = 'America/Mexico_City'");
});

const initDB = async () => {
  try {
    
    // 1. Tabla Usuarios 
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        telefono VARCHAR(20),
        puesto VARCHAR(255) NOT NULL,
        usuario VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );
    `);

    // 2. Tabla Clientes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        direccion VARCHAR(255),
        telefono VARCHAR(20)
      );
    `);

    // 3. Tabla Estatus
    await pool.query(`
      CREATE TABLE IF NOT EXISTS estatus (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL UNIQUE
      );
    `);

    // 4. Tabla Categorías
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        categoria VARCHAR(255) NOT NULL UNIQUE
      );
    `);

    // 5. Tabla Mobiliario
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mobiliario (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        tipo VARCHAR(255) NOT NULL,
        cantidad_disponible INTEGER NOT NULL,
        precio DECIMAL(10, 2) NOT NULL,
        id_categoria INTEGER REFERENCES categorias(id) ON DELETE SET NULL
      );
    `);

    // 6. Tabla Solicitudes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS solicitudes (
        id SERIAL PRIMARY KEY,
        fecha DATE DEFAULT CURRENT_DATE,
        inicio DATE NOT NULL,
        fin DATE NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        id_cliente INTEGER REFERENCES clientes(id),
        id_estatus INTEGER REFERENCES estatus(id),
        id_usuario INTEGER REFERENCES usuarios(id)
      );
    `);

    // 7. Tabla Detalles
    await pool.query(`
      CREATE TABLE IF NOT EXISTS detalles (
        id SERIAL PRIMARY KEY,
        id_solicitud INTEGER REFERENCES solicitudes(id) ON DELETE CASCADE,
        id_mobiliario INTEGER REFERENCES mobiliario(id),
        cantidad INTEGER NOT NULL
      );
    `);

    
    // Crear admin por defecto si la tabla está vacía
    const checkUsers = await pool.query('SELECT * FROM usuarios');
    if (checkUsers.rows.length === 0) {
      const hash = await bcrypt.hash('123456', 10);
      await pool.query(
        `INSERT INTO usuarios (nombre, telefono, puesto, usuario, password) VALUES ($1, $2, $3, $4, $5)`,
        ['Eduardo Admin', '555-0000', 'Gerencia', 'admin', hash]
      );
    }

    // Insertar un estatus por defecto si está vacía
    const checkEstatus = await pool.query('SELECT * FROM estatus');
    if (checkEstatus.rows.length === 0) {
      await pool.query(`INSERT INTO estatus (nombre) VALUES ('Pendiente'), ('Confirmada'), ('Completada'), ('Cancelada')`);
    }

    console.log('Base de datos reestructurada con éxito.');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error.message);
  }
};

initDB();


//rutas del loggin
app.post('/api/login', async (req, res) => {
  const { usuario, password } = req.body;
  
  try {
    // MAGIA AQUÍ: Usamos LOWER() en SQL para ignorar mayúsculas/minúsculas en el usuario
    const query = 'SELECT * FROM usuarios WHERE LOWER(usuario) = LOWER($1)';
    const result = await pool.query(query, [usuario]);

    // 1. Verificamos si existe el usuario
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    // 2. Verificamos la contraseña (ESTA SÍ ES LA CHINCHONA, EXACTA)
    // Usamos bcrypt.compare para evaluar la contraseña encriptada
    const passwordValida = await bcrypt.compare(password, user.password);

    if (passwordValida) {
      // Login exitoso, enviamos los datos del usuario (sin el password)
      res.json({ 
        success: true, 
        data: { id: user.id, nombre: user.nombre, usuario: user.usuario, puesto: user.puesto } 
      });
    } else {
      res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor al iniciar sesión' });
  }
});


//rutas de mobiliario

//obtener mobiliario
// Obtener mobiliario (INTELIGENTE Y MEJORADO: Calcula la fecha de regreso más próxima y suma las cantidades)
app.get('/api/mobiliario', async (req, res) => {
  try {
    const query = `
      SELECT 
        m.*, 
        c.categoria AS nombre_categoria,
        (
          SELECT s.fin 
          FROM detalles d 
          JOIN solicitudes s ON d.id_solicitud = s.id 
          WHERE d.id_mobiliario = m.id AND s.id_estatus = 1 
          ORDER BY s.fin ASC 
          LIMIT 1
        ) AS fecha_regreso,
        (
          SELECT SUM(d2.cantidad) 
          FROM detalles d2 
          JOIN solicitudes s2 ON d2.id_solicitud = s2.id 
          WHERE d2.id_mobiliario = m.id AND s2.id_estatus = 1 AND s2.fin = (
            SELECT MIN(s3.fin) 
            FROM detalles d3 
            JOIN solicitudes s3 ON d3.id_solicitud = s3.id 
            WHERE d3.id_mobiliario = m.id AND s3.id_estatus = 1
          )
        ) AS cantidad_regreso
      FROM mobiliario m 
      LEFT JOIN categorias c ON m.id_categoria = c.id 
      ORDER BY m.id ASC
    `;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener mobiliario:', error);
    res.status(500).json({ success: false, message: 'Error al cargar mobiliario' });
  }
});

//agregar mobiliario
app.post('/api/mobiliario', async (req, res) => {
  const { nombre, tipo, precio, cantidad_disponible, id_categoria } = req.body;
  try {
    const insertQuery = `
      INSERT INTO mobiliario (nombre, tipo, precio, cantidad_disponible, id_categoria) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const result = await pool.query(insertQuery, [nombre, tipo, precio, cantidad_disponible, id_categoria]);
    res.json({ success: true, message: 'Mobiliario agregado con éxito', data: result.rows[0] });
  } catch (error) {
    console.error('Error al agregar mobiliario:', error);
    res.status(500).json({ success: false, message: 'Error al agregar mobiliario' });
  }
});

//editar mobiliario
app.put('/api/mobiliario/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, tipo, precio, cantidad_disponible, id_categoria } = req.body;

  try {
    const updateQuery = `
      UPDATE mobiliario 
      SET nombre = $1, tipo = $2, precio = $3, cantidad_disponible = $4, id_categoria = $5 
      WHERE id = $6 RETURNING *
    `;
    const result = await pool.query(updateQuery, [nombre, tipo, precio, cantidad_disponible, id_categoria, id]);
    
    if (result.rows.length > 0) {
      res.json({ success: true, message: 'Mobiliario actualizado', data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Mobiliario no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar mobiliario:', error);
    res.status(500).json({ success: false, message: 'Error interno al actualizar' });
  }
});

//eliminar mobiliario
app.delete('/api/mobiliario/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleteQuery = 'DELETE FROM mobiliario WHERE id = $1 RETURNING *';
    const result = await pool.query(deleteQuery, [id]);

    if (result.rows.length > 0) {
      res.json({ success: true, message: 'Mobiliario eliminado con éxito' });
    } else {
      res.status(404).json({ success: false, message: 'Mobiliario no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar mobiliario:', error);
    res.status(500).json({ success: false, message: 'Error interno al eliminar' });
  }
});

//rutas de categorias
app.get('/api/categorias', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias ORDER BY id ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al cargar categorias' });
  }
});

app.post('/api/categorias', async (req, res) => {
  const { categoria } = req.body;
  try {
    const result = await pool.query(`INSERT INTO categorias (categoria) VALUES ($1) RETURNING *`, [categoria]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ success: false, message: 'La categoría ya existe' });
    } else {
      res.status(500).json({ success: false, message: 'Error al agregar' });
    }
  }
});

app.delete('/api/categorias/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const catRes = await pool.query('SELECT categoria FROM categorias WHERE id = $1', [id]);
    if (catRes.rows.length === 0) return res.status(404).json({ success: false, message: 'No encontrada' });
    
    const nombreCategoria = catRes.rows[0].categoria;
    const mobRes = await pool.query('SELECT COUNT(*) FROM mobiliario WHERE tipo = $1', [nombreCategoria]);
    const cantidadEnUso = parseInt(mobRes.rows[0].count);

    if (cantidadEnUso > 0) {
      return res.status(400).json({ success: false, message: `Acción denegada: Hay ${cantidadEnUso} elemento(s) usando la categoría "${nombreCategoria}".` });
    }

    await pool.query('DELETE FROM categorias WHERE id = $1', [id]);
    res.json({ success: true, message: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno' });
  }
});

//rutas de clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes ORDER BY id ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ success: false, message: 'Error al cargar clientes' });
  }
});

// Agregar un nuevo cliente
app.post('/api/clientes', async (req, res) => {
  const { nombre, direccion, telefono } = req.body;
  try {
    const query = `INSERT INTO clientes (nombre, direccion, telefono) VALUES ($1, $2, $3) RETURNING *`;
    const result = await pool.query(query, [nombre, direccion, telefono]);
    res.json({ success: true, message: 'Cliente registrado con éxito', data: result.rows[0] });
  } catch (error) {
    console.error('Error al agregar cliente:', error);
    res.status(500).json({ success: false, message: 'Error al registrar cliente' });
  }
});

// Editar un cliente
app.put('/api/clientes/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, direccion, telefono } = req.body;
  try {
    const query = `UPDATE clientes SET nombre = $1, direccion = $2, telefono = $3 WHERE id = $4 RETURNING *`;
    const result = await pool.query(query, [nombre, direccion, telefono, id]);
    if (result.rows.length > 0) {
      res.json({ success: true, message: 'Cliente actualizado', data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar' });
  }
});

// Eliminar un cliente con validación
app.delete('/api/clientes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const rentasRes = await pool.query('SELECT COUNT(*) FROM solicitudes WHERE id_cliente = $1', [id]);
    const cantidadRentas = parseInt(rentasRes.rows[0].count);

    if (cantidadRentas > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Acción denegada: Este cliente tiene ${cantidadRentas} renta(s) en el historial.` 
      });
    }

    await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
    res.json({ success: true, message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ success: false, message: 'Error interno al eliminar' });
  }
});

//rutas de estatus
app.get('/api/estatus', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM estatus ORDER BY id ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener estatus:', error);
    res.status(500).json({ success: false, message: 'Error al cargar estatus' });
  }
});

//rutas de rentas y pedidos

//obtener las rentas
app.get('/api/solicitudes', async (req, res) => {
  try {
    const query = `
      SELECT s.*, c.nombre AS cliente_nombre, e.nombre AS estatus_nombre, u.nombre AS usuario_nombre
      FROM solicitudes s
      LEFT JOIN clientes c ON s.id_cliente = c.id
      LEFT JOIN estatus e ON s.id_estatus = e.id
      LEFT JOIN usuarios u ON s.id_usuario = u.id
      ORDER BY s.id DESC
    `;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ success: false, message: 'Error al cargar las rentas' });
  }
});

//obtener los detalles de una renta en especifico
app.get('/api/solicitudes/:id/detalles', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT d.cantidad, m.nombre AS mobiliario_nombre, m.precio 
      FROM detalles d
      LEFT JOIN mobiliario m ON d.id_mobiliario = m.id
      WHERE d.id_solicitud = $1
    `;
    const result = await pool.query(query, [id]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener detalles de la solicitud:', error);
    res.status(500).json({ success: false, message: 'Error al cargar los detalles' });
  }
});

//crear una nueva renta
app.post('/api/solicitudes', async (req, res) => {
  const { inicio, fin, total, id_cliente, id_estatus, id_usuario, carrito } = req.body;
  const client = await pool.connect(); 

  try {
    await client.query('BEGIN'); //inicia la transacción

    //guardar la cabecera
    const insertSolicitud = `
      INSERT INTO solicitudes (inicio, fin, total, id_cliente, id_estatus, id_usuario)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
    `;
    const resSolicitud = await client.query(insertSolicitud, [inicio, fin, total, id_cliente, id_estatus, id_usuario]);
    const idSolicitud = resSolicitud.rows[0].id;

    //guardar detalles y restar inventario
    for (let item of carrito) {
      await client.query(
        `INSERT INTO detalles (id_solicitud, id_mobiliario, cantidad) VALUES ($1, $2, $3)`,
        [idSolicitud, item.id_mobiliario, item.cantidad]
      );

      await client.query(
        `UPDATE mobiliario SET cantidad_disponible = cantidad_disponible - $1 WHERE id = $2`,
        [item.cantidad, item.id_mobiliario]
      );
    }

    await client.query('COMMIT'); //confirmar Transacción
    res.json({ success: true, message: 'Renta registrada con éxito', id_solicitud: idSolicitud });

  } catch (error) {
    await client.query('ROLLBACK'); //deshacer en caso de error
    console.error('Error en transacción de solicitud:', error);
    res.status(500).json({ success: false, message: 'Error al registrar la renta' });
  } finally {
    client.release();
  }
});

//actualiza el estatus de una renta
app.put('/api/solicitudes/:id/estatus', async (req, res) => {
  const { id } = req.params;
  const { id_estatus } = req.body; 
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    //saber el estatus anterior
    const solicitudRes = await client.query('SELECT id_estatus FROM solicitudes WHERE id = $1', [id]);
    if (solicitudRes.rows.length === 0) throw new Error('Renta no encontrada');
    const estatusActual = solicitudRes.rows[0].id_estatus;

    //actualizar al nuevo estatus
    await client.query('UPDATE solicitudes SET id_estatus = $1 WHERE id = $2', [id_estatus, id]);

    //si cambia a Completada o Cancelada, devolver inventario
    if ((id_estatus === 3 || id_estatus === 4) && (estatusActual !== 3 && estatusActual !== 4)) {
      const detallesRes = await client.query('SELECT id_mobiliario, cantidad FROM detalles WHERE id_solicitud = $1', [id]);
      
      for (let item of detallesRes.rows) {
        await client.query(
          'UPDATE mobiliario SET cantidad_disponible = cantidad_disponible + $1 WHERE id = $2',
          [item.cantidad, item.id_mobiliario]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Estatus actualizado correctamente' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar estatus:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar la renta' });
  } finally {
    client.release();
  }
});

//rutas de usuarios


// ==========================================
// RUTAS DE USUARIOS (EMPLEADOS Y ADMINS)
// ==========================================

// Obtener todos los usuarios (sin enviar las contraseñas por seguridad)
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, usuario, puesto, telefono FROM usuarios ORDER BY id ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ success: false, message: 'Error al cargar usuarios' });
  }
});

// Agregar un nuevo usuario (CON ENCRIPTACIÓN DE CONTRASEÑA)
app.post('/api/usuarios', async (req, res) => {
  const { nombre, usuario, password, puesto, telefono } = req.body;
  try {
    // 🔐 Encriptamos la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO usuarios (nombre, usuario, password, puesto, telefono) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, usuario, puesto, telefono`;
    const result = await pool.query(query, [nombre, usuario, hashedPassword, puesto, telefono]);
    
    res.json({ success: true, message: 'Usuario creado con éxito', data: result.rows[0] });
  } catch (error) {
    console.error('Error al agregar usuario:', error);
    res.status(500).json({ success: false, message: 'Error al registrar. Verifica que el nombre de usuario no exista ya.' });
  }
});

// Editar un usuario (CON ENCRIPTACIÓN SI CAMBIA LA CONTRASEÑA)
app.put('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, usuario, password, puesto, telefono } = req.body;
  try {
    let query;
    let params;
    
    // Si se escribió una contraseña nueva, la ENCRIPTAMOS y la actualizamos.
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10); // 🔐 Encriptar nueva clave
      query = `UPDATE usuarios SET nombre = $1, usuario = $2, password = $3, puesto = $4, telefono = $5 WHERE id = $6 RETURNING id, nombre, usuario, puesto, telefono`;
      params = [nombre, usuario, hashedPassword, puesto, telefono, id];
    } else {
      // Si la dejó en blanco, no tocamos la contraseña en la BD.
      query = `UPDATE usuarios SET nombre = $1, usuario = $2, puesto = $3, telefono = $4 WHERE id = $5 RETURNING id, nombre, usuario, puesto, telefono`;
      params = [nombre, usuario, puesto, telefono, id];
    }

    const result = await pool.query(query, params);
    if (result.rows.length > 0) {
      res.json({ success: true, message: 'Usuario actualizado', data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar' });
  }
});

// Eliminar un usuario
app.delete('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (parseInt(id) === 1) {
      return res.status(400).json({ success: false, message: 'Acción denegada: No puedes eliminar al Administrador principal.' });
    }
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno al eliminar. Posiblemente este usuario ya registró rentas.' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});

