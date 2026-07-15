import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ticketsApi, TicketFilters } from '../api/tickets';
import { statsApi, TicketStats } from '../api/stats';
import { Ticket, TicketPage, PRIORITIES, STATUSES, STATUS_LABEL } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';
import { TicketForm } from '../components/TicketForm';
import { TicketHistory } from '../components/TicketHistory';
import { ApiError } from '../api/client';

export function TicketsPage() {
  const { user, isAdmin, logout } = useAuth();

  const [page, setPage] = useState<TicketPage | null>(null);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [filters, setFilters] = useState<TicketFilters>({ page: 1, pageSize: 5, order: 'desc', sortBy: 'created_at' });
  const [error, setError] = useState('');

  const [editing, setEditing] = useState<Ticket | null>(null);
  const [creating, setCreating] = useState(false);
  const [historyId, setHistoryId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const [pageData, statsData] = await Promise.all([
        ticketsApi.list(filters),
        statsApi.summary(),
      ]);
      setPage(pageData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cargar');
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const updateFilter = (patch: Partial<TicketFilters>) =>
    setFilters((f) => ({ ...f, ...patch, page: 1 }));

  const onDelete = async (id: number) => {
    if (!confirm(`¿Eliminar el ticket #${id}?`)) return;
    try {
      await ticketsApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al eliminar');
    }
  };

  return (
    <>
      <header className="app-header">
        <strong>Gestión de Tickets</strong>
        <div className="row" style={{ alignItems: 'center' }}>
          <span className="muted">
            {user?.name} · <b>{user?.role}</b>
          </span>
          <button className="secondary" onClick={logout}>
            Salir
          </button>
        </div>
      </header>

      <div className="container">
        {stats && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="spread">
              <h3 style={{ margin: 0 }}>Resumen ({stats.total} tickets)</h3>
            </div>
            <div className="row mt">
              <div className="grow">
                <p className="muted">Por estado</p>
                <div className="stat-grid">
                  {STATUSES.map((s) => (
                    <div className="stat" key={s}>
                      <div className="n">{stats.byStatus[s]}</div>
                      <div className="muted">{STATUS_LABEL[s]}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grow">
                <p className="muted">Por prioridad</p>
                <div className="stat-grid">
                  {PRIORITIES.map((p) => (
                    <div className="stat" key={p}>
                      <div className="n">{stats.byPriority[p]}</div>
                      <div className="muted" style={{ textTransform: 'capitalize' }}>
                        {p}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="spread">
            <h3 style={{ margin: 0 }}>Tickets</h3>
            <button onClick={() => setCreating(true)}>+ Nuevo ticket</button>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="row mt">
            <div className="grow">
              <label>Filtrar por estado</label>
              <select
                value={filters.status ?? ''}
                onChange={(e) => updateFilter({ status: e.target.value as TicketFilters['status'] })}
              >
                <option value="">Todos</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="grow">
              <label>Filtrar por prioridad</label>
              <select
                value={filters.priority ?? ''}
                onChange={(e) => updateFilter({ priority: e.target.value as TicketFilters['priority'] })}
              >
                <option value="">Todas</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="grow">
              <label>Buscar por título</label>
              <input
                value={filters.search ?? ''}
                onChange={(e) => updateFilter({ search: e.target.value })}
                placeholder="Texto…"
              />
            </div>
          </div>

          <table className="mt">
            <thead>
              <tr>
                <th>#</th>
                <th>Título</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Asignado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {page?.data.map((t) => (
                <tr key={t.id}>
                  <td className="muted">{t.id}</td>
                  <td>{t.title}</td>
                  <td>
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td>{STATUS_LABEL[t.status]}</td>
                  <td className="muted">{t.assignee?.name ?? '—'}</td>
                  <td>
                    <div className="row" style={{ gap: 6 }}>
                      <button className="secondary" onClick={() => setEditing(t)}>
                        Editar
                      </button>
                      <button className="secondary" onClick={() => setHistoryId(t.id)}>
                        Historial
                      </button>
                      {/* RN-02: la opción de eliminar solo se muestra a admin. */}
                      {isAdmin && (
                        <button className="danger" onClick={() => onDelete(t.id)}>
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {page && page.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted center">
                    No hay tickets que coincidan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {page && (
            <div className="pagination">
              <button
                className="secondary"
                disabled={page.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
              >
                ← Anterior
              </button>
              <span className="muted">
                Página {page.page} de {page.totalPages || 1}
              </span>
              <button
                className="secondary"
                disabled={page.page >= page.totalPages}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </div>

      {creating && (
        <TicketForm
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            load();
          }}
        />
      )}
      {editing && (
        <TicketForm
          ticket={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
      {historyId !== null && (
        <TicketHistory ticketId={historyId} onClose={() => setHistoryId(null)} />
      )}
    </>
  );
}
