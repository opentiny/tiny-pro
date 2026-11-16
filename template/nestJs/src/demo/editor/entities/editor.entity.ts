import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('editor_document')
export class EditorDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: '' })
  department: string;

  @Column({ default: '' })
  time: string;

  @Column({ type: 'longtext' })
  content: string;
}

@Entity('editor_collaboration_document')
export class EditorCollaborationDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'json' })
  members: string[];

  @Column({ default: '' })
  time: string;

  @Column({ type: 'longtext' })
  content: string;
}
