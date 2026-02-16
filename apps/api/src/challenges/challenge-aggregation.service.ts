import { Injectable } from "@nestjs/common";
import { ChallengeParticipantRepository } from "./repositories/challenge-participant.repository.js";
import { ChallengeRepository } from "./repositories/challenge.repository.js";

@Injectable()
export class ChallengeAggregationService {
  constructor(
    private readonly participantRepo: ChallengeParticipantRepository,
    private readonly challengeRepo: ChallengeRepository
  ) {}

  async onWorkoutCreated(
    userId: string,
    workout: { distance: number; duration: number; pace: number; date: Date }
  ): Promise<void> {
    const participations = await this.participantRepo.findActiveByUser(userId);

    const now = new Date();

    for (const participation of participations) {
      const { challenge } = participation;

      // Skip ended challenges
      if (challenge.endDate < now) {
        continue;
      }

      // Skip unsupported types
      if (challenge.type === "STREAK" || challenge.type === "PACE") {
        continue;
      }

      let newValue = participation.currentValue;

      // Aggregate based on challenge type
      if (challenge.type === "DISTANCE") {
        // Convert meters to km
        const distanceKm = workout.distance / 1000;
        newValue = participation.currentValue + distanceKm;
      } else if (challenge.type === "FREQUENCY") {
        newValue = participation.currentValue + 1;
      }

      // Check if completed
      const isCompleted = newValue >= challenge.targetValue;

      // Update progress
      await this.participantRepo.updateProgress(challenge.id, userId, newValue, isCompleted);
    }
  }
}
