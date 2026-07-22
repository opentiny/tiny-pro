import { Migration } from '@mikro-orm/migrations';

export class Migration20260722053021 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table \`lang\` (\`id\` varchar(36) not null, \`name\` text not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`i18\` (\`id\` varchar(36) not null, \`key\` text not null, \`content\` longtext not null, \`lang_id\` varchar(36) not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`i18\` add index \`i18_lang_id_index\` (\`lang_id\`);`);

    this.addSql(`create table \`menu\` (\`id\` varchar(36) not null, \`name\` text not null, \`order\` int not null, \`menu_type\` text not null, \`parent_id\` varchar(36) null, \`icon\` text null, \`component\` text not null, \`path\` text not null, \`locale\` text not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`menu\` add index \`menu_parent_id_index\` (\`parent_id\`);`);

    this.addSql(`create table \`permission\` (\`id\` varchar(36) not null, \`desc\` text not null, \`name\` text not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`role\` (\`id\` varchar(36) not null, \`name\` text not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`role_menu\` (\`id\` varchar(36) not null, \`role_id\` varchar(36) not null, \`menu_id\` varchar(36) not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`role_menu\` add index \`role_menu_role_id_index\` (\`role_id\`);`);
    this.addSql(`alter table \`role_menu\` add index \`role_menu_menu_id_index\` (\`menu_id\`);`);

    this.addSql(`create table \`role_permission\` (\`id\` varchar(36) not null, \`role_id\` varchar(36) not null, \`permission_id\` varchar(36) not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`role_permission\` add index \`role_permission_role_id_index\` (\`role_id\`);`);
    this.addSql(`alter table \`role_permission\` add index \`role_permission_permission_id_index\` (\`permission_id\`);`);

    this.addSql(`create table \`user\` (\`id\` varchar(36) not null, \`name\` text not null, \`email\` varchar(255) not null, \`password\` varchar(255) not null, \`department\` text null, \`employee_type\` text null, \`probation_start\` datetime null, \`probation_end\` datetime null, \`probation_duration\` text null, \`protocol_start\` datetime null, \`protocol_end\` datetime null, \`address\` text null, \`status\` int null, \`create_time\` datetime not null, \`update_time\` datetime null, \`salt\` text not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`user\` add index \`user_email_index\` (\`email\`);`);
    this.addSql(`alter table \`user\` add index \`user_password_index\` (\`password\`);`);

    this.addSql(`create table \`user_role\` (\`id\` varchar(36) not null, \`user_id\` varchar(36) not null, \`role_id\` varchar(36) not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`user_role\` add index \`user_role_user_id_index\` (\`user_id\`);`);
    this.addSql(`alter table \`user_role\` add index \`user_role_role_id_index\` (\`role_id\`);`);

    this.addSql(`alter table \`i18\` add constraint \`i18_lang_id_foreign\` foreign key (\`lang_id\`) references \`lang\` (\`id\`);`);

    this.addSql(`alter table \`user_role\` add constraint \`user_role_user_id_foreign\` foreign key (\`user_id\`) references \`user\` (\`id\`);`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table \`i18\` drop foreign key \`i18_lang_id_foreign\`;`);
    this.addSql(`alter table \`user_role\` drop foreign key \`user_role_user_id_foreign\`;`);

    this.addSql(`drop table if exists \`lang\`;`);
    this.addSql(`drop table if exists \`i18\`;`);
    this.addSql(`drop table if exists \`menu\`;`);
    this.addSql(`drop table if exists \`permission\`;`);
    this.addSql(`drop table if exists \`role\`;`);
    this.addSql(`drop table if exists \`role_menu\`;`);
    this.addSql(`drop table if exists \`role_permission\`;`);
    this.addSql(`drop table if exists \`user\`;`);
    this.addSql(`drop table if exists \`user_role\`;`);
  }

}
