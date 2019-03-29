import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdeaController } from './idea/idea.controller';
import { IdeaService } from './idea/idea.service';
import { IdeaModule } from './idea/idea.module';
import { HttpErrorFilter } from './shared/http-error.filter';
import { LoggingIntercerceptor } from './shared/logging.interceptor';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [TypeOrmModule.forRoot(),IdeaModule, UserModule, CommentModule],
  controllers: [AppController, IdeaController],
  providers: [AppService, IdeaService,UserService,{
    provide:APP_FILTER,
    useClass:HttpErrorFilter
  },
  {
    provide:APP_INTERCEPTOR,
    useClass:LoggingIntercerceptor
  }],
})
export class AppModule {}
