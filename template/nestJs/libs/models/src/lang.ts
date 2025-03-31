import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { I18 } from './i18n';

@Entity()
export class Lang {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @OneToMany(() => I18, (i18) => i18.lang)
  i18: I18[];
}
