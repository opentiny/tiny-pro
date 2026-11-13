import { Column, Entity, PrimaryColumn } from 'typeorm';

export abstract class DemoJsonData {
  @PrimaryColumn('int')
  id: number;

  @Column({ type: 'json' })
  data: Record<string, unknown>;
}

@Entity('board_home')
export class BoardHome extends DemoJsonData {}

@Entity('board_work_plan')
export class BoardWorkPlan extends DemoJsonData {}

@Entity('board_work_practice')
export class BoardWorkPractice extends DemoJsonData {}

@Entity('board_work_training')
export class BoardWorkTraining extends DemoJsonData {}

@Entity('board_work_practice_chart')
export class BoardWorkPracticeChart extends DemoJsonData {}

@Entity('user_info')
export class UserInfo extends DemoJsonData {}

@Entity('form_base')
export class FormBase extends DemoJsonData {}

@Entity('form_step')
export class FormStep extends DemoJsonData {}

@Entity('form_advance')
export class FormAdvance extends DemoJsonData {}

@Entity('profile_detail')
export class ProfileDetail extends DemoJsonData {}

@Entity('form_submission')
export class FormSubmission {
  @PrimaryColumn({ length: 36 })
  id: string;

  @Column({ type: 'json' })
  payload: Record<string, unknown>;

  @Column()
  createTime: string;
}
