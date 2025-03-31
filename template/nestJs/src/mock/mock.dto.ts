import { Matches } from 'class-validator';

export class MockDto {
  @Matches(/.*/)
  path: string;
}
