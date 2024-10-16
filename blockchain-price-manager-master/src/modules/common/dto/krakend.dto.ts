import { WebSocket } from 'ws';

export interface IKrakendMsg {
  msg?: string;
  url?: string;
  session?: {
    client_ip: string;
    uuid: string;
  };
  event?: string;
  body?: string;
}

export interface IKrakendSendMessage {
  client: WebSocket;
  uuid: string;
  body: object;
}
