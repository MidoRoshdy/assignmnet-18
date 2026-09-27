import { chatEvent, ChatEvent } from "./chatEvent";

export class RealtimeChatGetway {
  private chatEvent: ChatEvent;

  constructor() {
    this.chatEvent = chatEvent;
  }

  register(socket: any, io: any) {
    this.chatEvent.sayhi(socket);
    this.chatEvent.sendMessage(socket, io);
    this.chatEvent.sendGroupMessage(socket, io);
    this.chatEvent.joinRoom(socket);
  }
}
export const realtimeChatGetway = new RealtimeChatGetway();
