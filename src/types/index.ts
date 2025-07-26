/// <reference path="./pinia.d.ts" />

export interface User {
  id: number;
  name: string;
  firstname: string;
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

export interface TokenData {
  token: string;
  date: number;
}
