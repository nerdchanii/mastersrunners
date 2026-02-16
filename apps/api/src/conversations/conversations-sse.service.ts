import { Injectable, MessageEvent } from "@nestjs/common";
import { Subject, Observable } from "rxjs";

@Injectable()
export class ConversationsSseService {
  private connections = new Map<string, Subject<MessageEvent>>();

  addConnection(userId: string): Observable<MessageEvent> {
    // Complete and remove any existing connection for this user
    if (this.connections.has(userId)) {
      const existingSubject = this.connections.get(userId);
      existingSubject?.complete();
    }

    // Create new subject for this user
    const subject = new Subject<MessageEvent>();
    this.connections.set(userId, subject);

    // Return observable that cleans up on unsubscribe
    return new Observable<MessageEvent>((subscriber) => {
      const subscription = subject.subscribe(subscriber);

      return () => {
        subscription.unsubscribe();
        // Only remove if this is still the active connection
        if (this.connections.get(userId) === subject) {
          this.connections.delete(userId);
        }
      };
    });
  }

  removeConnection(userId: string): void {
    const subject = this.connections.get(userId);
    if (subject) {
      this.connections.delete(userId);
      subject.complete();
    }
  }

  sendToUser(userId: string, data: any): void {
    const subject = this.connections.get(userId);
    if (subject) {
      const event: MessageEvent = {
        type: "new-message",
        data,
      };
      subject.next(event);
    }
  }

  hasConnection(userId: string): boolean {
    return this.connections.has(userId);
  }

  removeAllConnections(): void {
    this.connections.forEach((subject) => subject.complete());
    this.connections.clear();
  }
}
