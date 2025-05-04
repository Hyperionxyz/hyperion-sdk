import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it('should return "Hello World!"', () => {
      expect(
        appController.getHello(
          "0x03d600ae79bd74c34b88a60a9dcc6dcb6d213f0dc12c19ae35b27028ac55d106"
        )
      ).toBe("Hello World!");
    });
  });
});
