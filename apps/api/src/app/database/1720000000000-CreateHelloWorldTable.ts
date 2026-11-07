import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateHelloWorldTable1720000000000 implements MigrationInterface {
  name = 'CreateHelloWorldTable1720000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const schema =
      queryRunner.connection.options.type === 'postgres'
        ? (queryRunner.connection.options.schema ?? 'public')
        : 'public';
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
      true,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const schema =
      queryRunner.connection.options.type === 'postgres'
        ? (queryRunner.connection.options.schema ?? 'public')
        : 'public';
    await queryRunner.dropTable(
      new Table({
        name: 'helloworld',
        schema,
      }),
    );
  }
}
