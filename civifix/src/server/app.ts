import { startApp } from 'modelence/server';
import exampleModule from '@/server/example';
import fixnetModule from '@/server/fixnet';
import { createDemoUser } from '@/server/migrations/createDemoUser';

startApp({
  modules: [exampleModule, fixnetModule],

  migrations: [{
    version: 1,
    description: 'Create demo user',
    handler: createDemoUser,
  }],
});
