import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrivateMessage } from './entities/private-message.entity'; // Ensure this file exists in the specified path
import { GroupMessage } from './entities/group-message.entity'; // Ensure this file exists in the specified path

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(PrivateMessage)
    private privateMessageRepository: Repository<PrivateMessage>,

    @InjectRepository(GroupMessage)
    private groupMessageRepository: Repository<GroupMessage>,
  ) {}

  async savePrivateMessage(sender: string, recipient: string, message: string) {
    const privateMessage = this.privateMessageRepository.create({
      sender,
      recipient,
      message,
    });
    return this.privateMessageRepository.save(privateMessage);
  }

  async saveGroupMessage(group: string, sender: string, message: string) {
    const groupMessage = this.groupMessageRepository.create({
      group,
      sender,
      message,
    });
    return this.groupMessageRepository.save(groupMessage);
  }

  async getPrivateMessageHistory(sender: string, recipient: string) {
    return this.privateMessageRepository.find({
      where: [
        { sender, recipient },
        { sender: recipient, recipient: sender },
      ],
      order: { createdAt: 'ASC' },
    });
  }

  async getGroupMessageHistory(group: string) {
    return this.groupMessageRepository.find({
      where: { group },
      order: { createdAt: 'ASC' },
    });
  }

  async getProfile(userId: string) {
    return this.privateMessageRepository.manager
      .getRepository('User')
      .findOne({ where: { id: userId } });
  }
}
