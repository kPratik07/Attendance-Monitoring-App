import { Schema, model, type InferSchemaType } from 'mongoose';

const loginHistorySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    loginAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['success', 'failed'], default: 'success' },
  },
  { timestamps: true },
);

export type LoginHistoryDocument = InferSchemaType<typeof loginHistorySchema>;

export const LoginHistoryModel = model('LoginHistory', loginHistorySchema);
