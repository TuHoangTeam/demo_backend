// import { MikroORM } from '@mikro-orm/core';
// import { Test } from '@nestjs/testing';
// import { MikroOrmModule } from '@mikro-orm/nestjs';
// import config from '../../mikro-orm.config';
// import { User } from '../../entities/user/User';
// import { UserController } from './user.controller';

// describe('user controller', () => {

//   let userController: UserController;
//   let orm: MikroORM;

//   beforeEach(async () => {
//     const module = await Test.createTestingModule({
//       imports: [
//         MikroOrmModule.forRoot({
//           ...config, // never move this line under any other line

//           dbName: 'mobile-demo-testing',
//           allowGlobalContext: true,
//         }),
//         MikroOrmModule.forFeature({ entities: [User] }),
//       ],
//       controllers: [UserController],
//     }).compile();

//     userController = module.get(UserController);
//     orm = module.get(MikroORM);
//     await orm.getSchemaGenerator().refreshDatabase();
//   });

//   afterAll(async () => await orm.close(true));

//   it(`CRUD`, async () => {
//     const res1 = await userController.create({ name: 'a1', age: 20 });
//     expect(res1.id).toBeDefined();
//     expect(res1.name).toBe('a1');
//     expect(res1.age).toBe(20);

//     const id = res1.id;

//     const res2 = await userController.find();
//     expect(res2).toHaveLength(1);
//     expect(res2[0].id).toBeDefined();
//     expect(res2[0].name).toBe('a1');
//     expect(res2[0].age).toBe(20);

//     const res3 = await userController.update(id, { name: 'a2' });
//     expect(res3.id).toBeDefined();
//     expect(res3.name).toBe('a2');
//     expect(res3.age).toBe(20);
//   });
// });