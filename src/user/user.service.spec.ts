import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  createConnection,
  getConnection,
  getRepository,
  Repository,
} from 'typeorm';
import { User } from './user.entitiy';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;
  const testConnectionName = 'testConnection';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();
    // mock用DBの作成
    const connection = await createConnection({
      type: 'sqlite',
      database: ':memory:', // inmemoryで動かす
      dropSchema: true,
      entities: [User],
      synchronize: true,
      logging: false,
      name: testConnectionName,
    });
    repository = getRepository(User, testConnectionName);
    // UserServiceをNewする
    service = new UserService(repository);
  });

  // テストが終わる度にMockDBをクリーンにする
  afterEach(async () => {
    await getConnection(testConnectionName).close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('find', () => {
    it('find', async () => {
      const user: User = {
        id: 1,
        firstName: 'test',
        lastName: 'user',
        isActive: true,
      };
      await repository.save(user);
      const inUsers = await service.findAll();
      expect(inUsers.length).toBe(1);
      expect(inUsers[0].firstName).toBe(user.firstName);
    });
  });
});
