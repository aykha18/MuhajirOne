import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class UpdateParcelRequestDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  itemType?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  declaredValueAed?: number;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  fromCountry?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  toCountry?: string;

  @IsOptional()
  @IsDateString()
  flexibleFromDate?: string;

  @IsOptional()
  @IsDateString()
  flexibleToDate?: string;
}
