import axios from 'axios';
import type { Notification, TypeNotification, CanalNotification } from '../types';

const client = axios.create({
  auth: { username: 'admin', password: '123' },
});

export const getNotifications = (candidatId: number): Promise<Notification[]> =>
  client.get<Notification[]>(`/api/candidats/${candidatId}/notifications`).then(r => r.data);

export const addNotification = (
  candidatId: number,
  n: { type: TypeNotification; canal: CanalNotification; message: string }
): Promise<Notification> =>
  client.post<Notification>(`/api/candidats/${candidatId}/notifications`, n).then(r => r.data);
