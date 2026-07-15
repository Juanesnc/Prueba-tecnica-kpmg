import { FormEvent, useState } from 'react';
import { Ticket, TicketPriority, TicketStatus, PRIORITIES, STATUSES, STATUS_LABEL, PRIORITY_RANK } from '../types';
import { ticketsApi, TicketPayload } from '../api/tickets';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

interface Props {
  ticket?: Ticket | null; // si viene, es edición
  onClose: () => void;
  onSaved: () => void;
}

export function TicketForm({ ticket, onClose, onSaved }: Props) {
  const { user, isAdmin } = useAuth();
  const isEdit = !!ticket;

  const [title, setTitle] = useState(ticket?.title ?? '');
  const [description, setDescription] = useState(ticket?.description ?? '');
  const [priority, setPriority] = useState<TicketPriority>(ticket?.priority ?? 'media');
  const [status, setStatus] = useState<TicketStatus>(ticket?.status ?? 'abierto');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // RN-01 reflejado en UI: al editar, un `user` no puede elegir prioridad menor a la actual.
  const currentRank = ticket ? PRIORITY_RANK[ticket.priority] : 0;
  const isPriorityDisabled = (p: TicketPriority) =>
    isEdit && !isAdmin && PRIORITY_RANK[p] < currentRank;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit && ticket) {
        await ticketsApi.update(ticket.id, { title, description, priority, status });
      } else {
        const payload: TicketPayload = {
          title,
          description,
          priority,
          status,
          user_id: user!.id,
        };
        await ticketsApi.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap" style={{ position: 'fixed', inset: 0, background: '#0009', zIndex: 10 }}>
      <form className="card login-card" onSubmit={onSubmit} style={{ width: 440 }}>
        <h3>{isEdit ? `Editar ticket #${ticket!.id}` : 'Nuevo ticket'}</h3>
        {error && <div className="error">{error}</div>}
        <div className="field">
          <label>Título</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="field">
          <label>Descripción</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} />
        </div>
        <div className="row">
          <div className="field grow">
            <label>Prioridad</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p} disabled={isPriorityDisabled(p)}>
                  {p}
                  {isPriorityDisabled(p) ? ' (no permitido)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="field grow">
            <label>Estado</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as TicketStatus)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
        {isEdit && !isAdmin && (
          <p className="muted">Como usuario, solo puedes mantener o aumentar la prioridad (RN-01).</p>
        )}
        <div className="spread mt">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
