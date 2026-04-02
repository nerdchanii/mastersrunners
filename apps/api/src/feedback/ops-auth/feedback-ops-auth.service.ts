import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

interface VerifiedFeedbackOperator {
  email: string;
}

type JoseModule = typeof import("jose");
type RemoteJwks = ReturnType<JoseModule["createRemoteJWKSet"]>;

@Injectable()
export class FeedbackOpsAuthService {
  private jwksCache = new Map<string, RemoteJwks>();

  constructor(private readonly config: ConfigService) {}

  async verifyAssertion(assertion: string): Promise<VerifiedFeedbackOperator> {
    const teamDomain = this.readRequiredEnv("CF_ACCESS_TEAM_DOMAIN");
    const audience = this.readRequiredEnv("CF_ACCESS_POLICY_AUD");
    const issuer = this.resolveIssuer(teamDomain);
    const jose = await import("jose");
    const jwks = this.getJwks(issuer, jose);

    try {
      const { payload } = await jose.jwtVerify(assertion, jwks, {
        issuer,
        audience,
      });

      const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";

      if (!email) {
        throw new UnauthorizedException("운영자 이메일을 확인할 수 없습니다.");
      }

      return { email };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException("운영자 Access 토큰을 확인할 수 없습니다.");
    }
  }

  private readRequiredEnv(key: string) {
    const value = this.config.get<string>(key)?.trim() || "";

    if (!value) {
      throw new InternalServerErrorException(`${key} 환경 변수가 필요합니다.`);
    }

    return value;
  }

  private resolveIssuer(teamDomain: string) {
    const normalizedDomain = teamDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${normalizedDomain}`;
  }

  private getJwks(issuer: string, jose: JoseModule) {
    const cached = this.jwksCache.get(issuer);

    if (cached) {
      return cached;
    }

    const jwks = jose.createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
    this.jwksCache.set(issuer, jwks);
    return jwks;
  }
}
