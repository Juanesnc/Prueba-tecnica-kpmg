import { sequelize } from '../config/database';
import { Role } from './role.model';
import { User } from './user.model';
import { Ticket } from './ticket.model';
import { HistoryLog } from './historyLog.model';

// -------- Asociaciones (relaciones del ORM) --------

// roles 1 --< users
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// users 1 --< tickets (usuario asignado)
User.hasMany(Ticket, { foreignKey: 'user_id', as: 'tickets' });
Ticket.belongsTo(User, { foreignKey: 'user_id', as: 'assignee' });

// tickets 1 --< history_logs
Ticket.hasMany(HistoryLog, { foreignKey: 'ticket_id', as: 'history' });
HistoryLog.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });

// users 1 --< history_logs (autor del cambio)
User.hasMany(HistoryLog, { foreignKey: 'user_id', as: 'changes' });
HistoryLog.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

export { sequelize, Role, User, Ticket, HistoryLog };
