const mongoose = require('mongoose');

const knowledgeArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  imageUrl: {
    type: String
  },
  videoUrl: {
    type: String
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
knowledgeArticleSchema.index({ category: 1 });
knowledgeArticleSchema.index({ tags: 1 });
knowledgeArticleSchema.index({ viewCount: 1 });

module.exports = mongoose.model('KnowledgeArticle', knowledgeArticleSchema);