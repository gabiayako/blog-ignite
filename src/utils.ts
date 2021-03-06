import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export const formatDate = (date: string): string =>
  format(new Date(date), 'dd MMM yyyy', {
    locale: ptBR,
  });

export const formatDateAndHour = (date: string): string =>
  format(new Date(date), "dd MMM yyyy', às 'HH:mm", {
    locale: ptBR,
  });
