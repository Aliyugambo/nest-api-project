import { BaseEntity } from 'src/helpers/base-entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class PrivateMessage extends BaseEntity {
  @Column()
  sender: string;

  @Column()
  recipient: string;

  @Column()
  message: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
