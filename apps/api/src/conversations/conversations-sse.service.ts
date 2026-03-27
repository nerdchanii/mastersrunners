import { Injectable, MessageEvent } from "@nestjs/common";
import { Observable, Subject } from "rxjs";

@Injectable()
export class ConversationsSseService {
  private connections = new Map<string, Set<Subject<MessageEvent>>>();

  addConnection(userId: string): Observable<MessageEvent> {
    const subject = new Subject<MessageEvent>();
    const subjects = this.connections.get(userId) ?? new Set<Subject<MessageEvent>>();
    subjects.add(subject);
    this.connections.set(userId, subjects);

    return new Observable<MessageEvent>((subscriber) => {
      const subscription = subject.subscribe(subscriber);

      return () => {
        subscription.unsubscribe();
        this.removeSubject(userId, subject);
      };
    });
  }

  removeConnection(userId: string): void {
    const subjects = this.connections.get(userId);
    if (subjects) {
      this.connections.delete(userId);
      subjects.forEach((subject) => subject.complete());
    }
  }

  sendToUser(userId: string, data: any): void {
    const subjects = this.connections.get(userId);
    if (subjects && subjects.size > 0) {
      const event: MessageEvent = { type: "new-message", data };
      subjects.forEach((subject) => subject.next(event));
    }
  }

  hasConnection(userId: string): boolean {
    return (this.connections.get(userId)?.size ?? 0) > 0;
  }

  removeAllConnections(): void {
    this.connections.forEach((subjects) => {
      subjects.forEach((subject) => subject.complete());
    });
    this.connections.clear();
  }

  private removeSubject(userId: string, subject: Subject<MessageEvent>): void {
    const subjects = this.connections.get(userId);
    if (!subjects) {
      return;
    }

    subjects.delete(subject);
    if (subjects.size === 0) {
      this.connections.delete(userId);
    }
  }
}
