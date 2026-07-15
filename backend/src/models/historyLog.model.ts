import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/database';
import { TicketPriority, TicketStatus } from './enums';

// Historial de cambios. INMUTABLE (RN-03): solo se permite INSERT.
// No expone timestamps de actualización porque nunca se actualiza.
export class HistoryLog extends Model<InferAttributes<HistoryLog>, InferCreationAttributes<HistoryLog>> {
  declare id: CreationOptional<number>;
  declare ticket_id: number;
  declare user_id: number; // usuario que realizó el cambio
  declare date: CreationOptional<Date>;
  declare priority: TicketPriority | null;
  declare status: TicketStatus | null;
}

HistoryLog.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    ticket_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tickets', key: 'id' } },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    priority: { type: DataTypes.ENUM(...Object.values(TicketPriority)), allowNull: true },
    status: { type: DataTypes.ENUM(...Object.values(TicketStatus)), allowNull: true },
  },
  {
    sequelize,
    tableName: 'history_logs',
    timestamps: false,
  }
);

// RN-03: bloqueo de inmutabilidad a nivel de modelo. Nunca UPDATE ni DELETE.
HistoryLog.beforeUpdate(() => {
  throw new Error('El historial es inmutable: no se permite actualizar entradas (RN-03).');
});
HistoryLog.beforeDestroy(() => {
  throw new Error('El historial es inmutable: no se permite eliminar entradas (RN-03).');
});
