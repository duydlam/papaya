import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('helloworld')
export class HelloWorld {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ length: 120 }) message!: string;
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
