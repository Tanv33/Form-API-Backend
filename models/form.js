import mongoose from "mongoose";
const Form = mongoose.model("form data", {
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  address: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  image1: {
    type: String,
  },
  image2: {
    type: String,
  },

  created: {
    type: Date,
    default: Date.now,
  },
});

export default Form;
