import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { sampleTenantConfigs } from './seeds/sample-tenant-configs';

export class CreateTenantConfiguration1730000000000 implements MigrationInterface {
  name = 'CreateTenantConfiguration1730000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const schema =
      queryRunner.connection.options.type === 'postgres'
        ? (queryRunner.connection.options.schema ?? 'public')
        : 'public';
    const escapedSchema = queryRunner.connection.driver.escape(schema);

    await queryRunner.createTable(
      new Table({
        name: 'tenants',
        schema,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'status',
            type: 'character varying',
            length: '16',
            default: "'active'",
          },
          { name: 'currentVersion', type: 'integer', default: '1' },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          { name: 'archivedAt', type: 'timestamptz', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'tenant_config_versions',
        schema,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'tenantId', type: 'uuid' },
          { name: 'version', type: 'integer' },
          { name: 'config', type: 'jsonb' },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          { name: 'restoredFromVersion', type: 'integer', isNullable: true },
        ],
        uniques: [
          {
            name: 'UQ_tenant_config_version',
            columnNames: ['tenantId', 'version'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK_tenant_config_versions_tenant',
            columnNames: ['tenantId'],
            referencedTableName: 'tenants',
            referencedSchema: schema,
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          },
        ],
      }),
      true,
    );

    for (const [index, sample] of sampleTenantConfigs.entries()) {
      const tenantId = `00000000-0000-4000-8000-${(index + 1).toString().padStart(12, '0')}`;
      await queryRunner.query(
        `INSERT INTO ${escapedSchema}."tenants" ("id", "status", "currentVersion") VALUES ($1, 'active', 1) ON CONFLICT ("id") DO NOTHING`,
        [tenantId],
      );
      await queryRunner.query(
        `INSERT INTO ${escapedSchema}."tenant_config_versions" ("tenantId", "version", "config") VALUES ($1, 1, $2::jsonb) ON CONFLICT ("tenantId", "version") DO NOTHING`,
        [tenantId, JSON.stringify(sample.config)],
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const schema =
      queryRunner.connection.options.type === 'postgres'
        ? (queryRunner.connection.options.schema ?? 'public')
        : 'public';
    await queryRunner.dropTable(
      new Table({ name: 'tenant_config_versions', schema }),
      true,
    );
    await queryRunner.dropTable(new Table({ name: 'tenants', schema }), true);
  }
}
