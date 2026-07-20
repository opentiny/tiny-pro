import request from 'supertest';
import { E2EApp } from './utils/e2e-app';

describe('PermissionController (e2e)', () => {
  let e2e: E2EApp;
  beforeAll(async () => {
    e2e = new E2EApp();
    await e2e.init();
  });
  afterAll(async () => {
    await e2e.close();
  });
  beforeEach(async () => {
    await e2e.clearData();
  });
  it('/permission (GET) - 初始状态应为空', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(e2e.app.getHttpServer())
      .get('/permission')
      .expect(200)
      .expect([]);
  });
});
