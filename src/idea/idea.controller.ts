import { Controller, Get, Post, Put, Delete, Body, Param, UsePipes, ValidationPipe, UseGuards, Logger } from '@nestjs/common';
import { IdeaDTO } from './idea.dto';
import { IdeaService } from './idea.service';
import { AuthGuard } from 'src/shared/auth.gaurd';
import { User } from 'src/shared/user.decorator';
import { userInfo } from 'os';
import { throws } from 'assert';

@Controller('idea')
export class IdeaController {
    private logger = new Logger('IdeaController');

    public constructor(private ideaService: IdeaService) { }

    private logData(options: any) {
        options.user && this.logger.log('USER' + JSON.stringify(options.user));
        options.body && this.logger.log('BODY' + JSON.stringify(options.body));
        options.id && this.logger.log('IDEA' + JSON.stringify(options.id));
    }


    @Get()
    showAllBlogs() {
        return this.ideaService.showAll();
    }

    @Post()
    @UseGuards(new AuthGuard)
    @UsePipes(new ValidationPipe)
    createBlog(@User('id') user, @Body() data: IdeaDTO) {
        this.logData({ user, data });
        return this.ideaService.create(user, data);
    }

    @Get(':id')
    read(@Param('id') id: number) {
        return this.ideaService.read(id);
    }

    @Put(':id')
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe)
    updateIdea(@Param('id') id: number, @User('id') user: number, @Body() data: Partial<IdeaDTO>) {
        this.logData({ id, data, user });
        return this.ideaService.update(id, user, data);
    }

    @Delete(':id')
    @UseGuards(new AuthGuard())
    destroyBlog(@Param('id') id: number, @User('id') user) {
        return this.ideaService.destroy(id, user);
    }

    @Post(':id/upvote')
    @UseGuards(new AuthGuard())
    upvoteIdea(@Param('id') id: number, @User('id') user: number) {
        this.logData({ id, user });
        return this.ideaService.upvote(id,user);
    }

    @Post(':id/downvote')
    @UseGuards(new AuthGuard())
    downvoteIdea(@Param('id') id: number, @User('id') user: number) {
        this.logData({ id, user });
        return this.ideaService.downvote(id,user);
    }

    @Post(':id/bookmark')
    @UseGuards(new AuthGuard())
    bookmarkIdea(@Param('id') id: number, @User('id') user: number) {
        this.logData({ id, user });
        return this.ideaService.bookmark(id, user)
    }

    @Delete(':id/bookmark')
    @UseGuards(new AuthGuard())
    unbookmarkIdea(@Param('id') id: number, @User('id') user: number) {
        this.logData({ id, user });
        return this.ideaService.unbookmark(id, user);
    }
}
