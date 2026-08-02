import { Schema, model, type InferSchemaType } from 'mongoose';

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export type NotificationDocument = InferSchemaType<typeof notificationSchema>;

export const NotificationModel = model('Notification', notificationSchema);
