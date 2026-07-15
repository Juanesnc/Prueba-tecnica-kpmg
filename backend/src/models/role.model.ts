import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/database';
import { RoleName } from './enums';

export class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
  declare id: CreationOptional<number>;
  declare name: RoleName;
}

Role.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: {
      type: DataTypes.ENUM(...Object.values(RoleName)),
      allowNull: false,
      unique: true,
    },
  },
  { sequelize, tableName: 'roles', timestamps: false }
);
