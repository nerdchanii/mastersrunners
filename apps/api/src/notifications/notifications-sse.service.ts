import { Injectable, MessageEvent } from "@nestjs/common";
import { Subject, Observable } from "rxjs";

@Injectable()
export class NotificationsSseService {
  private connections = new Map<string, Subject<MessageEvent>>();

  addConnection(userId: string): Observable<MessageEvent> {
    if (this.connections.has(userId)) {
      const existing = this.connections.get(userId);
      existing?.complete();
    }

    const subject = new Subject<MessageEvent>();
    this.connections.set(userId, subject);

    return new Observable<MessageEvent>((subscriber) => {
      const subscription = subject.subscribe(subscriber);

      return () => {
        subscription.unsubscribe();
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

  sendToUser(userId: string, data: string | object): void {
    const subject = this.connections.get(userId);
    if (subject) {
      const event: MessageEvent = {
        type: "notification",
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
