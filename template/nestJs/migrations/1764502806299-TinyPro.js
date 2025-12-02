const { MigrationInterface, QueryRunner } = require('typeorm');
class TinyPro1764502806240 {
  name = 'TinyPro1764502806240';
  async up(queryRunner) {
    await queryRunner.query(
      `CREATE TABLE \`application\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`icon\` varchar(255) NOT NULL, \`tag\` varchar(255) NOT NULL, \`classify\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
  }
  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE \`application\``);
  }
}

module.exports = TinyPro1764502806240;
