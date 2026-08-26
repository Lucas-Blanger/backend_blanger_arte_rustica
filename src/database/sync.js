// Script utilitário para criar/atualizar as tabelas no Neon a partir dos models Sequelize. Rode com: npm run db:sync
const { sequelize, testConnection } = require("../config/database");
require("./associations");

(async () => {
  await testConnection();
  const alter = process.argv.includes("--alter");
  const force = process.argv.includes("--force");

  await sequelize.sync({ alter, force });
  console.log(`[DB] Sincronização concluída (alter=${alter}, force=${force}).`);
  process.exit(0);
})().catch((err) => {
  console.error("[DB] Falha ao sincronizar:", err);
  process.exit(1);
});
