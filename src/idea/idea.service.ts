import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { IdeaDTO, IdeaRO } from './idea.dto';
import { IdeaEntity } from './idea.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { json } from 'body-parser';
import { Votes } from 'src/shared/votes.enum';

@Injectable()
export class IdeaService {

    constructor(@InjectRepository(IdeaEntity) private blogRepository: Repository<IdeaEntity>,
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>) { }

    private toResponseObject(idea: IdeaEntity): IdeaRO {
        const responseObject: any = { ...idea, author: idea.author.toResponseObject(false) }
        if (responseObject.upvotes) {
            responseObject.upvotes = idea.upvotes.length;
        }
        if (responseObject.downvotes) {
            responseObject.downvotes = idea.downvotes.length;
        }
        return responseObject;
    }

    private ensureOwnerShip(idea: IdeaEntity, userId: number) {
        if (idea.author.id !== userId) {
            throw new HttpException('Incorrect User', HttpStatus.UNAUTHORIZED);
        }
    }

    private async vote(idea: IdeaEntity, user: UserEntity, vote: Votes) {
        const opposite = vote === Votes.UP ? Votes.DOWN : Votes.UP;
        if (
          idea[opposite].filter(voter => voter.id === user.id).length > 0 ||
          idea[vote].filter(voter => voter.id === user.id).length > 0
        ) {
          idea[opposite] = idea[opposite].filter(voter => voter.id !== user.id);
          idea[vote] = idea[vote].filter(voter => voter.id !== user.id);
          await this.blogRepository.save(idea);
        } else if (idea[vote].filter(voter => voter.id === user.id).length < 1) {
          idea[vote].push(user);
          await this.blogRepository.save(idea);
        } else {
          throw new HttpException('Unable to cast vote', HttpStatus.BAD_REQUEST);
        }
    
        return idea;
      }

    async showAll(): Promise<IdeaRO[]> {
        const ideas = await this.blogRepository.find({ relations: ['author', 'upvotes', 'downvotes','comments'] });
        return ideas.map(idea => this.toResponseObject(idea));
    }

    async create(userId: number, data: IdeaDTO): Promise<IdeaRO> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const idea = await this.blogRepository.create({ ...data, author: user });

        await this.blogRepository.save(idea);

        return this.toResponseObject(idea);
    }

    async read(id: number): Promise<IdeaRO> {
        const idea = await this.blogRepository.findOne({ where: { id }, relations: ['author','upvotes','downvotes','comments'] });
        if (!idea) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }
        return this.toResponseObject(idea);
    }

    async update(id: number, userId: number, data: Partial<IdeaDTO>): Promise<IdeaRO> {
        let idea = await this.blogRepository.findOne({ where: { id }, relations: ['author','comments'] })
        if (!idea) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }
        this.ensureOwnerShip(idea, userId);
        await this.blogRepository.update({ id }, data);

        idea = await this.blogRepository.findOne({
            where: { id },
            relations: ['author','comments']
        });
        return this.toResponseObject(idea);
    }

    async destroy(id: number, userId: number) {
        const idea = await this.blogRepository.findOne({ where: { id }, relations: ['author','comments'] });
        if (!idea) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }
        this.ensureOwnerShip(idea, userId);
        await this.blogRepository.delete({ id });
        return this.toResponseObject(idea);
    }

    async upvote(id:number,userId:number){
        let idea = await this.blogRepository.findOne({where:{id},relations:['author','upvotes','downvotes','comments']});

        const user = await this.userRepository.findOne({where: {id:userId}});

        idea = await this.vote(idea,user,Votes.UP);

        return this.toResponseObject(idea);
    }

    async downvote(id:number,userId:number){
        let idea = await this.blogRepository.findOne({where:{id},relations:['author','upvotes','downvotes','comments']});

        const user = await this.userRepository.findOne({where: {id:userId}});

        idea = await this.vote(idea,user,Votes.DOWN);

        return this.toResponseObject(idea);
    }

    async bookmark(id: number, userId: number) {
        const idea = await this.blogRepository.findOne({ where: { id } });
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['bookmarks'] });

        if (user.bookmarks.filter(bookmark => bookmark.id === idea.id).length < 1) {
            user.bookmarks.push(idea);
            await this.userRepository.save(user);
        } else {
            throw new HttpException('idea already bookmarked', HttpStatus.BAD_REQUEST);
        }

        return user.toResponseObject();
    }

    async unbookmark(id:number,userId: number)
    {
        const idea = await this.blogRepository.findOne({where:{id}});
        const user = await this.userRepository.findOne({where:{id:userId},relations:['bookmarks']});

        if (user.bookmarks.filter(bookmark => bookmark.id === idea.id).length > 0) {
            user.bookmarks = user.bookmarks.filter(bookmark => bookmark.id !== idea.id)
            await this.userRepository.save(user);
        } else {
            throw new HttpException('idea already bookmarked', HttpStatus.BAD_REQUEST);
        }

        return user.toResponseObject();
    }
}
