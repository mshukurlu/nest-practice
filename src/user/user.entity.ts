import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, BeforeInsert, OneToMany, ManyToMany, JoinTable } from "typeorm";
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { IdeaEntity } from "src/idea/idea.entity";
import { JoinAttribute } from "typeorm/query-builder/JoinAttribute";
import { response } from "express";
@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn({
        name: 'id',
        type: 'integer',
    })
    id:number

    @CreateDateColumn()
    created:Date;
    
    @Column({
    type:'text',
    unique:true
    })
    username:string

    @Column('text')
    password:string;

    @OneToMany(type => IdeaEntity, idea => idea.author)
    ideas: IdeaEntity[];

    @ManyToMany(type=>IdeaEntity,{cascade:true})
    @JoinTable()
    bookmarks: IdeaEntity[];

    @BeforeInsert()
    async hashPassword() {
       this.password = await bcrypt.hash(this.password,10); 
    }

    toResponseObject(showToken:boolean = true){
        const {id,created,username,token} = this;
        const responseObject: any =  {id,created,username};
        if (showToken) {
            responseObject.token = token;
        }
        if (this.ideas) {
            responseObject.ideas = this.ideas;
        }
        if (this.bookmarks) {
            responseObject.bookmarks = this.bookmarks;
        }
        return responseObject;
    }

    async comparePassword(attempt:string) {
        return await bcrypt.compare(attempt,this.password);
    }

    private get token() {
        const {id,username} = this;

        return jwt.sign({
            id,username
        },process.env.SECRET,{expiresIn:'7d'})
    }
}