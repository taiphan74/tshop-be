import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  user_id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  password_hash: string;

  @Column({ name: 'full_name', nullable: true })
  full_name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'date', name: 'date_of_birth', nullable: true })
  date_of_birth: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ name: 'size_preference', nullable: true })
  size_preference: string;

  @Column({ name: 'style_preference', nullable: true })
  style_preference: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  last_login: Date;

  @Column({ name: 'is_email_verified', default: false })
  is_email_verified: boolean;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;
}
