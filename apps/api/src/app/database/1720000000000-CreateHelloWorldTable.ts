import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateHelloWorldTable1720000000000 implements MigrationInterface {
  name = 'CreateHelloWorldTable1720000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA ?? 'public';
    await queryRunner.createTable(
      new Table({
        name: 'helloworld',
        schema,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'message', type: 'character varying', length: '120' },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(
      new Table({
        name: 'helloworld',
        schema: process.env.DB_SCHEMA ?? 'public',
      }),
    );
  }
}
