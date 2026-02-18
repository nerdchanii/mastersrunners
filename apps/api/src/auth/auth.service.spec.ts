import { Test } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import type { OAuthProfile } from "./auth.service";
import { UserRepository } from "./repositories/user.repository";
import { AccountRepository } from "./repositories/account.repository";

const mockUserRepo = {
  findById: jest.fn(),
  findByIdWithProfile: jest.fn(),
  findByEmail: jest.fn(),
  createWithAccount: jest.fn(),
};

const mockAccountRepo = {
  findByProviderWithUser: jest.fn(),
  updateTokens: jest.fn(),
  createForUser: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: AccountRepository, useValue: mockAccountRepo },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe("generateTokens", () => {
    it("should call JwtService.sign twice for access and refresh tokens", () => {
      mockJwtService.sign.mockReturnValueOnce("access-token").mockReturnValueOnce("refresh-token");
      mockConfigService.get.mockReturnValue(604800);

      const result = service.generateTokens({ id: "u1", email: "t@t.com" });

      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(1, { sub: "u1", email: "t@t.com" });
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(2, { sub: "u1", email: "t@t.com" }, { expiresIn: 604800 });
      expect(result).toEqual({ accessToken: "access-token", refreshToken: "refresh-token" });
    });
  });

  describe("upsertOAuthUser", () => {
    const baseProfile: OAuthProfile = {
      provider: "kakao",
      providerAccountId: "kakao-123",
      email: "test@test.com",
      name: "Test User",
      profileImage: "https://img.test/photo.jpg",
      accessToken: "oauth-access",
      refreshToken: "oauth-refresh",
    };

    it("should update tokens and return user when account exists", async () => {
      const existingUser = { id: "u1", email: "test@test.com" };
      mockAccountRepo.findByProviderWithUser.mockResolvedValue({
        id: "a1",
        user: existingUser,
      });

      const result = await service.upsertOAuthUser(baseProfile);

      expect(mockAccountRepo.updateTokens).toHaveBeenCalledWith("a1", "oauth-access", "oauth-refresh");
      expect(result).toEqual({ ...existingUser, deletedAt: null });
      expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepo.createWithAccount).not.toHaveBeenCalled();
    });

    it("should link account to existing user when email matches", async () => {
      const existingUser = { id: "u1", email: "test@test.com" };
      mockAccountRepo.findByProviderWithUser.mockResolvedValue(null);
      mockUserRepo.findByEmail.mockResolvedValue(existingUser);

      const result = await service.upsertOAuthUser(baseProfile);

      expect(mockAccountRepo.createForUser).toHaveBeenCalledWith("u1", {
        type: "oauth",
        provider: "kakao",
        providerAccountId: "kakao-123",
        access_token: "oauth-access",
        refresh_token: "oauth-refresh",
      });
      expect(result).toEqual(existingUser);
      expect(mockUserRepo.createWithAccount).not.toHaveBeenCalled();
    });

    it("should create new user with account when no existing account or user", async () => {
      const newUser = { id: "u-new", email: "test@test.com" };
      mockAccountRepo.findByProviderWithUser.mockResolvedValue(null);
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.createWithAccount.mockResolvedValue(newUser);

      const result = await service.upsertOAuthUser(baseProfile);

      expect(mockUserRepo.createWithAccount).toHaveBeenCalledWith(
        {
          email: "test@test.com",
          name: "Test User",
          profileImage: "https://img.test/photo.jpg",
          emailVerified: expect.any(Date),
        },
        {
          type: "oauth",
          provider: "kakao",
          providerAccountId: "kakao-123",
          access_token: "oauth-access",
          refresh_token: "oauth-refresh",
        },
      );
      expect(result).toEqual(newUser);
    });

    it("should use placeholder email when email is null", async () => {
      const profileNoEmail: OAuthProfile = { ...baseProfile, email: null };
      const newUser = { id: "u-new", email: "kakao_kakao-123@placeholder.local" };
      mockAccountRepo.findByProviderWithUser.mockResolvedValue(null);
      mockUserRepo.createWithAccount.mockResolvedValue(newUser);

      await service.upsertOAuthUser(profileNoEmail);

      const call = mockUserRepo.createWithAccount.mock.calls[0][0];
      expect(call.email).toBe("kakao_kakao-123@placeholder.local");
      expect(call.emailVerified).toBeNull();
    });
  });

  describe("refreshTokens", () => {
    it("should verify token and return new token pair", async () => {
      const mockUser = { id: "u1", email: "t@t.com" };
      mockJwtService.verify.mockReturnValue({ sub: "u1", email: "t@t.com" });
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce("new-access").mockReturnValueOnce("new-refresh");
      mockConfigService.get.mockReturnValue(604800);

      const result = await service.refreshTokens("valid-refresh-token");

      expect(mockJwtService.verify).toHaveBeenCalledWith("valid-refresh-token");
      expect(mockUserRepo.findById).toHaveBeenCalledWith("u1");
      expect(result).toEqual({ accessToken: "new-access", refreshToken: "new-refresh" });
    });

    it("should throw UnauthorizedException when user not found", async () => {
      mockJwtService.verify.mockReturnValue({ sub: "unknown" });
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(service.refreshTokens("token")).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException when token is invalid", async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error("jwt expired");
      });

      await expect(service.refreshTokens("expired-token")).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("getUser", () => {
    it("should return user profile", async () => {
      const mockUser = { id: "u1", email: "t@t.com", name: "Test", profileImage: null, bio: "Runner", createdAt: new Date() };
      mockUserRepo.findByIdWithProfile.mockResolvedValue(mockUser);

      const result = await service.getUser("u1");

      expect(mockUserRepo.findByIdWithProfile).toHaveBeenCalledWith("u1");
      expect(result).toEqual(mockUser);
    });

    it("should throw UnauthorizedException when user not found", async () => {
      mockUserRepo.findByIdWithProfile.mockResolvedValue(null);

      await expect(service.getUser("unknown")).rejects.toThrow(UnauthorizedException);
    });
  });
});
