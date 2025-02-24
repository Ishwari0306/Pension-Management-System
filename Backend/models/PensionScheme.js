const pensionSchemeSchema = new mongoose.Schema({
    schemeName: {
      type: String,
      required: true
    },
    contributionRate: {
      type: Number,
      required: true  // Percentage of salary
    },
    employerContribution: {
      type: Number,
      required: true  // Percentage matched by employer
    },
    minServiceYears: {
      type: Number,
      default: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });