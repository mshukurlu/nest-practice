import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { UserDTO, UserRO } from './user.dto';

@Injectable()
export class UserService {

    constructor(@InjectRepository(UserEntity) private userRepistory: Repository<UserEntity>){}

    async showAll(): Promise<UserRO[]> {
        const users = await this.userRepistory.find({relations:['ideas','bookmarks']});
        return users.map(user=>user.toResponseObject(false));
    }
    async login(data:UserDTO): Promise<UserRO[]> {
        const {username,password} = data;

        const user = await this.userRepistory.findOne({where: {username}});

        if(!user || !(await user.comparePassword(password)))
        {
            throw new HttpException('Invalid username/password',HttpStatus.BAD_REQUEST);
        }

        return user.toResponseObject();
    }

    async register(data:UserDTO): Promise<UserRO> {
        const {username} = data;
        let user = await  this.userRepistory.findOne({where:{username}});
        if (user){
            throw new HttpException('User already exists',HttpStatus.BAD_REQUEST);
        }
        user = await this.userRepistory.create(data);
        await this.userRepistory.save(user);
        return user.toResponseObject()
    }
}
