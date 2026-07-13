import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, IsIn, IsString, IsArray } from 'class-validator';

export class Condition {
  @ApiProperty({ enum: ['input', 'enum'] })
  @IsIn(['input', 'enum'])
  type: 'input' | 'enum';
}

export class EnumCondition {
  @IsIn(['enum'])
  type: 'enum';

  @IsArray()
  @IsString({ each: true })
  value: string[];
}

export class StringRelation {
  @ApiProperty({ example: 'example' })
  text: string;

  @ApiProperty({
    enum: ['equals', 'unequal', 'startwith', 'contains'],
    example: 'contains',
  })
  relation: 'equals' | 'unequal' | 'startwith' | 'contains';
}

export class NumberRelation {
  @ApiProperty({ example: 100 })
  text: number;

  @ApiProperty({
    enum: ['greaterThan', 'lessThan', 'equalToGreaterThan', 'equalToLessThan'],
    example: 'greaterThan',
  })
  relation:
    | 'greaterThan'
    | 'lessThan'
    | 'equalToGreaterThan'
    | 'equalToLessThan';
}

@ApiExtraModels(StringRelation, NumberRelation)
export class InputCondition extends Condition {
  @ApiProperty({ enum: ['input'], example: 'input' })
  @IsIn(['input'])
  declare type: 'input'; // 固定为 'input'

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(StringRelation) },
      { $ref: getSchemaPath(NumberRelation) },
    ],
    discriminator: {
      propertyName: 'relation',
      mapping: {
        equals: getSchemaPath(StringRelation),
        unequal: getSchemaPath(StringRelation),
        startwith: getSchemaPath(StringRelation),
        contains: getSchemaPath(StringRelation),
        greaterThan: getSchemaPath(NumberRelation),
        lessThan: getSchemaPath(NumberRelation),
        equalToGreaterThan: getSchemaPath(NumberRelation),
        equalToLessThan: getSchemaPath(NumberRelation),
      },
    },
  })
  @ValidateNested()
  @Type(() => Object, {
    discriminator: {
      property: 'relation',
      subTypes: [
        { value: StringRelation, name: 'equals' },
        { value: StringRelation, name: 'unequal' },
        { value: StringRelation, name: 'startwith' },
        { value: StringRelation, name: 'contains' },
        { value: NumberRelation, name: 'greaterThan' },
        { value: NumberRelation, name: 'lessThan' },
        { value: NumberRelation, name: 'equalToGreaterThan' },
        { value: NumberRelation, name: 'equalToLessThan' },
      ],
    },
  })
  value: StringRelation | NumberRelation;
}

export function ConditionMap(options?: {
  description?: string;
  example?: any;
}) {
  return applyDecorators(
    ApiProperty({
      type: 'object',
      additionalProperties: {
        oneOf: [
          { $ref: getSchemaPath(InputCondition) },
          { $ref: getSchemaPath(EnumCondition) },
        ],
      },
      description:
        options?.description ||
        '键名任意，值为 InputCondition 或 EnumCondition',
      example: options?.example || {
        name: {
          type: 'input',
          value: { text: 'YX', relation: 'contains' },
        },
        status: {
          type: 'enum',
          value: ['active', 'pending'],
        },
      },
    }),
    ValidateNested(),
    Type(() => Condition, {
      discriminator: {
        property: 'type',
        subTypes: [
          { value: InputCondition, name: 'input' },
          { value: EnumCondition, name: 'enum' },
        ],
      },
    }),
  );
}
