import { Label } from './label';

export interface Issue {
  id: number;
  title: string;
  labels: Label[];
}