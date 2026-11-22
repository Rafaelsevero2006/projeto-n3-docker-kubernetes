const express = require('express');
const mysql = require('mysql2/promise');
const { createClient } = require('redis');

const VERSAO = '2.0'; // para a v2.0, altere aqui (mudanca visivel)
const app = express();
app.use(express.json());

// Configuracao 100% por variaveis de ambiente
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'loja',
};
const redis = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
});
redis.on('error', (e) => console.error('Redis:', e.message));

let pool;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Tenta conectar ate o banco ficar pronto (o app nao morre se o MySQL demorar)
async function iniciar() {
  await redis.connect().catch((e) => console.error('Redis inicial:', e.message));
  for (;;) {
    try {
      pool = mysql.createPool(dbConfig);
      await pool.query(
        'CREATE TABLE IF NOT EXISTS produtos (id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(100) NOT NULL, preco DECIMAL(10,2) NOT NULL)'
      );
      console.log('MySQL pronto');
      break;
    } catch (e) {
      console.log('Aguardando MySQL...', e.code || e.message);
      await sleep(3000);
    }
  }
}

// Liveness: o processo esta vivo
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Readiness: so recebe trafego se o banco responde
app.get('/ready', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});

app.get('/', async (_req, res) => {
  let visitas = null;
  try { visitas = await redis.incr('visitas'); } catch {}
  res.json({ app: 'Loja API', versao: VERSAO, pod: process.env.HOSTNAME, visitas });
});

app.get('/produtos', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM produtos ORDER BY id');
  res.json(rows);
});

app.post('/produtos', async (req, res) => {
  const { nome, preco } = req.body;
  if (!nome || preco == null) return res.status(400).json({ erro: 'nome e preco obrigatorios' });
  const [r] = await pool.query('INSERT INTO produtos (nome, preco) VALUES (?, ?)', [nome, preco]);
  res.status(201).json({ id: r.insertId, nome, preco });
});

iniciar();
app.listen(3000, () => console.log('API na porta 3000'));
