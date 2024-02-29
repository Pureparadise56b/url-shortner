import mongoose from 'mongoose'

const urlSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    shortId: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

export const Url = mongoose.model('Url', urlSchema)
