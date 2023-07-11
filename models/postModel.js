import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: Object,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
        replies: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
            reply: {
              type: String,
              required: true,
            },
            createdAt: {
              type: Date,
              default: () => Date.now(),
              immutable: true,
            },
          },
        ],
        createdAt: {
          type: Date,
          default: () => Date.now(),
        },
      },
    ],
  },
  { timestamps: true, collection: "posts" }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
