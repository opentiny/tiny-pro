const {config} = require('dotenv');
const typeorm = require('typeorm');

config({ path: '.env' })

async function app(){
  const datasource = new typeorm.DataSource({
    type: 'mysql',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    migrations: ['./migrations/**/*.js']
  });

  await datasource.initialize();

  const migrates = await datasource.runMigrations();
  if (migrates.length === 0) {
    console.warn(`Your database is up-to-date, no migrations were applied. `);
  } else {
    console.log(`${migrates.length} complete.`);
    console.log(`Now you can safely launched the project`)
  }
  return true;
}

app()
.then(()=>{
  process.exit(0);
})
