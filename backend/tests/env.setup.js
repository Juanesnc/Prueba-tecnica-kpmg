// Debe ejecutarse antes de importar cualquier módulo que lea la configuración,
// para que la base de datos use SQLite en memoria.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
