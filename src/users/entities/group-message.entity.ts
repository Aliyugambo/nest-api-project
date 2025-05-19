import { BaseEntity } from 'src/helpers/base-entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class GroupMessage extends BaseEntity {
  @Column()
  group: string;

  @Column()
  sender: string;

  @Column()
  message: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
