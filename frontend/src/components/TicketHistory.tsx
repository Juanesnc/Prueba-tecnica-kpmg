import { useEffect, useState } from 'react';
import { HistoryEntry, STATUS_LABEL } from '../types';
import { ticketsApi } from '../api/tickets';

// Historial en SOLO LECTURA (RN-03): sin acciones de editar/eliminar para ningún rol.
export function TicketHistory({ ticketId, onClose }: { ticketId: number; onClose: () => void }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketsApi.history(ticketId).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [ticketId]);

  return (
    <div className="login-wrap" style={{ position: 'fixed', inset: 0, background: '#0009', zIndex: 10 }}>
      <div className="card" style={{ width: 520 }}>
        <div className="spread">
          <h3>Historial del ticket #{ticketId}</h3>
          <button className="secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <p className="muted">Registro inmutable de cambios (solo lectura).</p>
        {loading ? (
          <p>Cargando…</p>
        ) : entries.length === 0 ? (
          <p className="muted">Sin cambios registrados.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Autor</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="muted">{new Date(e.date).toLocaleString()}</td>
                  <td>{e.priority ?? '—'}</td>
                  <td>{e.status ? STATUS_LABEL[e.status] : '—'}</td>
                  <td className="muted">{e.author?.name ?? `#${e.user_id}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
