import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Lang } from './lang';

@Entity('i18')
export class I18 {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Lang)
  // @Column()
  lang: Lang;
  @Column()
  key: string;
  @Column({ type: 'longtext' })
  content: string;
}
