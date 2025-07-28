/// <reference path="./pinia.d.ts" />

export interface User {
  id: number;
  name: string;
  firstname: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  maxSecurity: boolean;
  rank: 1 | 2 | 3;
  question: string;
  reponse: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserId extends User {
  Posts: Post[];
}

export interface Reaction {
  id: number;
  type: '1' | '2' | '3';
  createdAt: string;
  updatedAt: string;
  PostId: Post['id'];
  UserId: User['id'];
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  PostId: Post['id'];
  UserId: User['id'];
  User?: Partial<User>;
}

export interface CommentId extends Comment {
  Post?: Partial<Post>;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  media: File | string | null;
  createdAt: string;
  updatedAt: string;
  UserId: User['id'];
  User?: Partial<User>;
  Reactions: [] | Reaction[];
  Comments: [] | Comment[];
}

export interface Token {
  id: number;
  token: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  UserId: User['id'];
}

export interface TokenData {
  token: Token['token'];
  date: number;
}

export interface ReactionTypes {
  type: Reaction['type'];
  icon: string;
  onClass: string;
  offClass: string;
}
