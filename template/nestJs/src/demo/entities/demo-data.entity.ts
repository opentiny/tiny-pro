import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('demo_data')
export class DemoData {
  @PrimaryColumn({ name: 'data_key', length: 100 })
  key: string;

  @Column({ type: 'json' })
  data: Record<string, unknown>;
}

@Entity('form_submission')
export class FormSubmission {
  @PrimaryColumn({ length: 36 })
  id: string;

  @Column({ type: 'json' })
  payload: Record<string, unknown>;

  @Column()
  createTime: string;
}
