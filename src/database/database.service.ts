// src/database/database.service.ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Database } from './types';
import { db } from './db';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: Kysely<Database>;

  constructor() {
    this.db = db;
  }

  async onModuleInit() {
    // Test the database connection
    try {
      await this.db.selectFrom('users').execute();
      console.log('Database connection established');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.db.destroy();
  }

  // Getter to access the database instance
  get database() {
    return this.db;
  }
}
