import { Module } from '@nestjs/common';

import { IdeaController } from './idea.controller'
import { IdeaService} from './idea.service';

import {IdeaEntity} from './idea.entity';
import {TypeOrmModule} from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
@Module({
    imports:[TypeOrmModule.forFeature([IdeaEntity,UserEntity])],
    controllers:[IdeaController],
    providers:[IdeaService],
})
export class    IdeaModule {}
