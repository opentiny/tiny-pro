import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { I18 } from './i18n';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Lang {
  @ApiProperty({
    description: '语言ID',
  })
  @PrimaryGeneratedColumn()
  id: number;
  @ApiProperty({
    description: '语言名称',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: '语言对应的国际化词条',
    type: ()=>[I18]
  })
  @OneToMany(() => I18, (i18) => i18.lang)
  i18: I18[];
}
