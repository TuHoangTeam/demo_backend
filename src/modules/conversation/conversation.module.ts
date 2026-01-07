import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConversationController } from './conversation.controller';

// Import các Entities liên quan
import { Conversation } from '../../entities/social/Conversation';
import { Message } from '../../entities/social/Message';
import { User } from '../../entities/user/User';
import { Item } from '../../entities/item/Item';

@Module({
  imports: [
    MikroOrmModule.forFeature([Conversation, Message, User, Item]),
  ],
  controllers: [ConversationController],
  providers: [],
})
export class ConversationModule {}