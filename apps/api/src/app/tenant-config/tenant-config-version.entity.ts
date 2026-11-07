import type { TenantConfig } from '@papaya/contracts';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('tenant_config_versions')
@Unique(['tenantId', 'version'])
export class TenantConfigVersion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  tenantId!: string;

  @Column({ type: 'integer' })
  version!: number;

  @Column({ type: 'jsonb' })
  config!: TenantConfig;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'integer', nullable: true })
  restoredFromVersion!: number | null;
}
