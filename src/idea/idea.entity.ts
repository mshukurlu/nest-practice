import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, ManyToOne, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { CommentEntity } from 'src/comment/comment.entity';

@Entity()
export class IdeaEntity {
    @PrimaryGeneratedColumn({
        name: 'id',
        type: 'integer',
    })
    id!: number

    @CreateDateColumn() created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column('text') idea: string;

    @Column('text') description: string;


    @ManyToOne(type => UserEntity, author => author.ideas)
    author: UserEntity;

    @ManyToMany(type => UserEntity, { cascade: true })
    @JoinTable()
    upvotes: UserEntity[];

    @ManyToMany(type => UserEntity, { cascade: true })
    @JoinTable()
    downvotes: UserEntity[];
    bookmarks: any;

    @OneToMany(type => CommentEntity, comment => comment.idea, { cascade: true })
    comments: CommentEntity[]
}