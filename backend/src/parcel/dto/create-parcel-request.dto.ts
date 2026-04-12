import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateParcelRequestDto {
  @IsString()
  @Length(1, 100)
  itemType!: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsNumber()
  @Min(0.1)
  weightKg!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  declaredValueAed?: number;

  @IsString()
  @Length(2, 100)
  fromCountry!: string;

  @IsString()
  @Length(2, 100)
  toCountry!: string;

  @IsDateString()
  flexibleFromDate!: string;

  @IsDateString()
  flexibleToDate!: string;
}
