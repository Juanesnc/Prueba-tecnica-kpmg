import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import { sequelize } from '../config/database';
import { TicketPriority, TicketStatus } from './enums';
import { User } from './user.model';

export class Ticket extends Model<InferAttributes<Ticket>, InferCreationAttributes<Ticket>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare description: string;
  declare priority: TicketPriority;
  declare status: CreationOptional<TicketStatus>;
  declare user_id: number | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;

  declare assignee?: NonAttribute<User>;
}

Ticket.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    priority: {
      type: DataTypes.ENUM(...Object.values(TicketPriority)),
      allowNull: false,
      defaultValue: TicketPriority.MEDIA,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TicketStatus)),
      allowNull: false,
      defaultValue: TicketStatus.ABIERTO,
    },
    user_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'users', key: 'id' } },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'tickets',
    timestamps: true,
    paranoid: true, // soft delete
  }
);
