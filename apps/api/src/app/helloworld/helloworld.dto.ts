import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateHelloWorldDto {
  @IsString() @IsNotEmpty() @MaxLength(120) message!: string;
}
export class UpdateHelloWorldDto extends CreateHelloWorldDto {}
