import { Injectable, MessageEvent } from "@nestjs/common";
import { Observable, Subject } from "rxjs";

const SSE_HEARTBEAT_INTERVAL_MS = 25_000;

export interface NotificationsSseConnection {
  close: () => void;
  stream: Observable<MessageEvent>;
}

@Injectable()
export class NotificationsSseService {
  private connections = new Map<string, Set<Subject<MessageEvent>>>();

  addConnection(userId: string): NotificationsSseConnection {
    const subject = new Subject<MessageEvent>();
    const subjects = this.connections.get(userId) ?? new Set<Subject<MessageEvent>>();
    subjects.add(subject);
    this.connections.set(userId, subjects);

    let closed = false;
    const close = () => {
      if (closed) {
        return;
      }

      closed = true;
      clearInterval(heartbeat);
      this.removeSubject(userId, subject);
      subject.complete();
    };

    const heartbeat = setInterval(() => {
      if (!this.connections.get(userId)?.has(subject)) {
        clearInterval(heartbeat);
        return;
      }

      subject.next({ type: "heartbeat", data: "" });
    }, SSE_HEARTBEAT_INTERVAL_MS);
    subject.subscribe({
      complete: () => {
        clearInterval(heartbeat);
      },
    });

    const stream = new Observable<MessageEvent>((subscriber) => {
      const subscription = subject.subscribe(subscriber);

      return () => {
        subscription.unsubscribe();
        close();
      };
    });

    return { close, stream };
  }

  removeConnection(userId: string): void {
    const subjects = this.connections.get(userId);
    if (subjects) {
      this.connections.delete(userId);
      subjects.forEach((subject) => subject.complete());
    }
  }

  sendToUser(userId: string, data: string | object): void {
    const subjects = this.connections.get(userId);
    if (subjects && subjects.size > 0) {
      const event: MessageEvent = {
        type: "notification",
        data,
      };
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
