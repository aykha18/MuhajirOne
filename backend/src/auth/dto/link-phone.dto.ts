import { IsOptional, IsString, Length } from 'class-validator';

export class LinkPhoneDto {
  @IsString()
  @Length(6, 20)
  phoneNumber!: string;

  @IsString()
  @Length(4, 8)
  code!: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  deviceFingerprint?: string;
}
