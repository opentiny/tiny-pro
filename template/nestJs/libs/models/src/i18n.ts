import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Lang } from './lang';
import { ApiProperty } from '@nestjs/swagger';

@Entity('i18')
export class I18 {

  @ApiProperty({
    description: '国际化词条主键',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: '国际化词条对应的语言',
    type: ()=>Lang
  })
  @ManyToOne(() => Lang)
  // @Column()
  lang: Lang;

  @ApiProperty({
    description: '国际化词条key',
  })
  @Column()
  key: string;

  @ApiProperty({
    description: '国际化词条内容',
  })
  @Column({ type: 'longtext' })
  content: string;
}
