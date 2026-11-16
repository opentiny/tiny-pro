const { MigrationInterface, QueryRunner } = require('typeorm');
class TinyPro1794560974177 {
  name = 'TinyPro1794560974177';
  async up(queryRunner) {
    await queryRunner.query(
      `CREATE TABLE \`board_home\` (\`id\` int NOT NULL, \`data\` json NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`board_work_plan\` (\`id\` int NOT NULL, \`data\` json NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`board_work_practice\` (\`id\` int NOT NULL, \`data\` json NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`board_work_training\` (\`id\` int NOT NULL, \`data\` json NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`board_work_practice_chart\` (\`id\` int NOT NULL, \`data\` json NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`user_info\` (\`id\` int NOT NULL, \`data\` json NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`form_base\` (\`id\` int NOT NULL, \`data\` json NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`form_step\` (\`id\` int NOT NULL, \`data\` json NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`form_advance\` (\`id\` int NOT NULL, \`data\` json NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`profile_detail\` (\`id\` int NOT NULL, \`data\` json NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`form_submission\` (\`id\` varchar(36) NOT NULL, \`payload\` json NOT NULL, \`createTime\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`project\` (\`id\` varchar(36) NOT NULL, \`projectName\` varchar(255) NOT NULL, \`projectCode\` varchar(255) NOT NULL, \`projectStatus\` varchar(255) NOT NULL, \`taskStatus\` varchar(255) NOT NULL, \`department\` varchar(255) NOT NULL, \`startTime\` varchar(255) NOT NULL, \`endTime\` varchar(255) NOT NULL, \`priority\` varchar(255) NOT NULL, \`owner\` varchar(255) NOT NULL, \`progress\` int NOT NULL DEFAULT 0, \`manHours\` int NOT NULL DEFAULT 0, \`budget\` int NOT NULL DEFAULT 0, \`teamSize\` int NOT NULL DEFAULT 0, \`goal\` varchar(1000) NOT NULL DEFAULT '', \`technology\` varchar(500) NOT NULL DEFAULT '', \`partner\` varchar(500) NOT NULL DEFAULT '', \`riskLevel\` varchar(16) NOT NULL DEFAULT '', \`quality\` varchar(1000) NOT NULL DEFAULT '', \`remark\` varchar(1000) NOT NULL DEFAULT '', \`versions\` json NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`employee\` (\`id\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`employeeNo\` varchar(255) NOT NULL, \`department\` varchar(255) NOT NULL, \`departmentLevel\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL, \`workbenchName\` varchar(255) NOT NULL, \`project\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL, \`roles\` varchar(255) NOT NULL, \`lastUpdateUser\` varchar(255) NOT NULL, \`createTime\` varchar(255) NOT NULL, \`rank\` varchar(255) NOT NULL DEFAULT '', \`description\` varchar(255) NOT NULL DEFAULT '', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`editor_document\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`department\` varchar(255) NOT NULL DEFAULT '', \`time\` varchar(255) NOT NULL DEFAULT '', \`content\` longtext NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`editor_collaboration_document\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`members\` json NOT NULL, \`time\` varchar(255) NOT NULL DEFAULT '', \`content\` longtext NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
  }
  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE \`editor_collaboration_document\``);
    await queryRunner.query(`DROP TABLE \`editor_document\``);
    await queryRunner.query(`DROP TABLE \`employee\``);
    await queryRunner.query(`DROP TABLE \`project\``);
    await queryRunner.query(`DROP TABLE \`form_submission\``);
    await queryRunner.query(`DROP TABLE \`profile_detail\``);
    await queryRunner.query(`DROP TABLE \`form_advance\``);
    await queryRunner.query(`DROP TABLE \`form_step\``);
    await queryRunner.query(`DROP TABLE \`form_base\``);
    await queryRunner.query(`DROP TABLE \`user_info\``);
    await queryRunner.query(`DROP TABLE \`board_work_practice_chart\``);
    await queryRunner.query(`DROP TABLE \`board_work_training\``);
    await queryRunner.query(`DROP TABLE \`board_work_practice\``);
    await queryRunner.query(`DROP TABLE \`board_work_plan\``);
    await queryRunner.query(`DROP TABLE \`board_home\``);
  }
}

module.exports = TinyPro1794560974177;
