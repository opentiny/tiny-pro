const { MigrationInterface, QueryRunner } = require('typeorm');
class TinyPro1751959540200 {
  name = 'TinyPro1751959540200';
  async up(queryRunner) {
    await queryRunner.query(
      `CREATE TABLE \`permission\` (\`id\` int NOT NULL AUTO_INCREMENT, \`desc\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`menu\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`order\` int NOT NULL, \`parentId\` int NULL, \`menuType\` varchar(255) NOT NULL, \`icon\` varchar(255) NULL, \`component\` varchar(255) NOT NULL, \`path\` varchar(255) NOT NULL, \`locale\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`role\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`department\` varchar(255) NULL, \`employeeType\` varchar(255) NULL, \`probationStart\` timestamp NULL, \`probationEnd\` timestamp NULL, \`probationDuration\` varchar(255) NULL, \`protocolStart\` timestamp NULL, \`protocolEnd\` timestamp NULL, \`address\` varchar(255) NULL, \`status\` int NULL, \`createTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updateTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`create_time\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`salt\` varchar(255) NULL, \`update_time\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`lang\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`i18\` (\`id\` int NOT NULL AUTO_INCREMENT, \`key\` varchar(255) NOT NULL, \`content\` longtext NOT NULL, \`langId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`role_permission\` (\`roleId\` int NOT NULL, \`permissionId\` int NOT NULL, INDEX \`IDX_e3130a39c1e4a740d044e68573\` (\`roleId\`), INDEX \`IDX_72e80be86cab0e93e67ed1a7a9\` (\`permissionId\`), PRIMARY KEY (\`roleId\`, \`permissionId\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`role_menu\` (\`roleId\` int NOT NULL, \`menuId\` int NOT NULL, INDEX \`IDX_4a57845f090fb832eeac3e3486\` (\`roleId\`), INDEX \`IDX_ed7dbf72cc845b0c9150a67851\` (\`menuId\`), PRIMARY KEY (\`roleId\`, \`menuId\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`user_role\` (\`userId\` int NOT NULL, \`roleId\` int NOT NULL, INDEX \`IDX_ab40a6f0cd7d3ebfcce082131f\` (\`userId\`), INDEX \`IDX_dba55ed826ef26b5b22bd39409\` (\`roleId\`), PRIMARY KEY (\`userId\`, \`roleId\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`i18\` ADD CONSTRAINT \`FK_ee6c070b91e32eae04e541e5844\` FOREIGN KEY (\`langId\`) REFERENCES \`lang\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permission\` ADD CONSTRAINT \`FK_e3130a39c1e4a740d044e685730\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permission\` ADD CONSTRAINT \`FK_72e80be86cab0e93e67ed1a7a9a\` FOREIGN KEY (\`permissionId\`) REFERENCES \`permission\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`role_menu\` ADD CONSTRAINT \`FK_4a57845f090fb832eeac3e34860\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`role_menu\` ADD CONSTRAINT \`FK_ed7dbf72cc845b0c9150a678512\` FOREIGN KEY (\`menuId\`) REFERENCES \`menu\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role\` ADD CONSTRAINT \`FK_ab40a6f0cd7d3ebfcce082131fd\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role\` ADD CONSTRAINT \`FK_dba55ed826ef26b5b22bd39409b\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
  }
  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE \`permission\``);
    await queryRunner.query(`DROP TABLE \`menu\``);
    await queryRunner.query(`DROP TABLE \`role\``);
    await queryRunner.query(`DROP TABLE \`user\``);
    await queryRunner.query(`DROP TABLE \`lang\``);
    await queryRunner.query(`DROP TABLE \`i18\``);
    await queryRunner.query(`DROP TABLE \`role_permission\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_e3130a39c1e4a740d044e68573\` ON \`role_permission\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_72e80be86cab0e93e67ed1a7a9\` ON \`role_permission\``
    );
    await queryRunner.query(`DROP TABLE \`role_menu\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_4a57845f090fb832eeac3e3486\` ON \`role_menu\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_ed7dbf72cc845b0c9150a67851\` ON \`role_menu\``
    );
    await queryRunner.query(`DROP TABLE \`user_role\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_ab40a6f0cd7d3ebfcce082131f\` ON \`user_role\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_dba55ed826ef26b5b22bd39409\` ON \`user_role\``
    );
    await queryRunner.query(
      `ALTER TABLE \`i18\` DROP FOREIGN KEY \`FK_ee6c070b91e32eae04e541e5844\``
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permission\` DROP FOREIGN KEY \`FK_e3130a39c1e4a740d044e685730\``
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permission\` DROP FOREIGN KEY \`FK_72e80be86cab0e93e67ed1a7a9a\``
    );
    await queryRunner.query(
      `ALTER TABLE \`role_menu\` DROP FOREIGN KEY \`FK_4a57845f090fb832eeac3e34860\``
    );
    await queryRunner.query(
      `ALTER TABLE \`role_menu\` DROP FOREIGN KEY \`FK_ed7dbf72cc845b0c9150a678512\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role\` DROP FOREIGN KEY \`FK_ab40a6f0cd7d3ebfcce082131fd\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role\` DROP FOREIGN KEY \`FK_dba55ed826ef26b5b22bd39409b\``
    );
  }
}

module.exports = TinyPro1751959540200;
