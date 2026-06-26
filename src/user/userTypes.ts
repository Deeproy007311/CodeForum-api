export interface User {
  _id: string;

  name: string;
  username: string;
  email: string;
  password: string;

  avatar: string;
  bio: string;
  skills: string[];

  emailVerified: boolean;

  createdAt: Date;
  updatedAt: Date;
}