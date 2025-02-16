import mongoose from "mongoose";
const { Schema } = mongoose;

const SchemeSchema = new Schema({
  SchemeTitle: {
    type: String,
    required: true,
  },
  SchemeProviderState: {
    type: String,
    required: true,
  },
  SchemeDescription: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  benefits: {
    type: String,
    required: true,
  },
  eligibility: {
    type: String,
    required: true,
  },
  applicationProcess: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
});
const Scheme = mongoose.models.Scheme || mongoose.model("Scheme", SchemeSchema);

export default Scheme;
