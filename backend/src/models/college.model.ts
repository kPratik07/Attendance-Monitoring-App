import { Schema, model, type InferSchemaType } from 'mongoose';

const collegeSchema = new Schema(
  {
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    allowedRadiusMeters: { type: Number, required: true, default: 100 },
    address: { type: String, required: true },
  },
  { timestamps: true },
);

export type CollegeDocument = InferSchemaType<typeof collegeSchema>;

export const CollegeModel = model('College', collegeSchema);
