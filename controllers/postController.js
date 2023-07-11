import asyncHandler from "express-async-handler";
import Post from "../models/postModel.js";
import mongoose from "mongoose";
import cloudinary from "../utils/cloudinary.js";

const createPost = asyncHandler(async (req, res) => {
  const { content, image } = req.body;
  const user = req.user;

  let uploadedImage;
  if (image) {
    uploadedImage = await cloudinary.uploader.upload(image, {
      upload_preset: "socialmedia",
    });
  }

  try {
    const post = await Post.create({
      user: user._id,
      content,
      image: uploadedImage ? uploadedImage : null,
    });

    res.status(200).json({
      message: "Created a Post successfully",
      post,
    });
  } catch (error) {
    res.status(400);
    console.log("Error:", error);
    throw new Error("Invalid post data");
  }
});

const getAllPosts = asyncHandler(async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user")
      .populate("comments.user", "username")
      .populate("comments.replies.user", "username")
      .sort({ createdAt: -1 });
    return res.status(200).json({ message: "Got All posts", posts });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const deletePost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(404).json({ error: "No such Post exists" });
  }
  const user = req.user;
  const post = await Post.findById(postId);
  if (post && post.user.toString() === user._id.toString()) {
    await Post.findByIdAndDelete({ _id: postId });
    return res.status(200).json({ message: "Post deleted Successfully", post });
  } else {
    res.status(404);
    throw new Error("Post not found or unauthorized");
  }
});

const updatePost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const postId = req.params.postId;
  const user = req.user;
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(404).json({ error: "No such Post exists" });
  }
  const post = await Post.findById(postId);
  if (post && post.user.toString() === user._id.toString()) {
    post.content = content;
    const updatedPost = await post.save();
    return res
      .status(200)
      .json({ message: "Post updated successfully", updatedPost });
  } else {
    res.status(400);
    throw new Error("Post not found or unauthorized");
  }
});

const getSinglePost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const post = await Post.findById(postId).populate("user");
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(404).json({ error: "No such Post exists" });
  }
  if (post) {
    return res.status(200).json({ message: "Got single Post", post });
  } else {
    res.status(400);
    throw new Error("Post not found");
  }
});

const likePost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const user = req.user;
  const post = await Post.findById(postId);
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(404).json({ error: "No such Post exists" });
  }
  if (post) {
    if (!post.likes.includes(user._id)) {
      post.likes.push(user._id);
      await post.save();
    }
    res.status(200).json({ message: "Post liked Successfully", post });
  } else {
    res.status(400);
    throw new Error("Post not available");
  }
});

const unlikePost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const user = req.user;
  const post = await Post.findById(postId);
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(404).json({ error: "No such Post exists" });
  }
  if (post) {
    if (post.likes.includes(user._id)) {
      post.likes.pull(user._id);
      await post.save();
    }
    res.status(200).json({ message: "Post unliked Successfully", post });
  } else {
    res.status(400);
    throw new Error("Post not available");
  }
});

const addComment = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const user = req.user;
  const { comment } = req.body;
  const post = await Post.findById(postId);
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(404).json({ error: "No such Post exists" });
  }

  if (post) {
    post.comments.push({ user, comment });
    await post.save();
    res.status(201).json({ message: "Comment on Post", post, user });
  } else {
    res.status(400);
    throw new Error("Not such post available");
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;
  const user = req.user;
  const post = await Post.findById(postId);
  const commentt = post.comments.find((c) => c._id.toString() === commentId);

  if (!post) {
    res.status(400);
    throw new Error("Post not found");
  }

  if (!commentt) {
    res.status(400);
    throw new Error("Comment not found");
  }

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    res.status(404);
    throw new Error("No such post exists");
  }
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    res.status(404);
    throw new Error("No such comment exists");
  }

  if (commentt.user.toString() !== user._id.toString()) {
    res.status(400);
    throw new Error("You are not authorized to delete this comment");
  }

  post.comments = post.comments.filter((c) => c._id.toString() !== commentId);

  await post.save();

  res.status(200).json({ message: "Comment deleted Successfully" });
});

const replyToComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;
  const { reply } = req.body;
  const post = await Post.findById(postId);
  const comment = post.comments.find((c) => c._id.toString() === commentId);
  if (!post) {
    res.status(400);
    throw new Error("No such post exists");
  }
  if (!comment) {
    res.status(400);
    throw new Error("No such comment exists");
  }
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    res.status(404);
    throw new Error("No such post exists");
  }
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    res.status(404);
    throw new Error("No such comment exists");
  }

  if (post && comment) {
    if (!comment.replies) {
      comment.replies = [];
    }
    comment.replies.push({ reply, user: req.user._id });
    await post.save();
    return res.status(200).json({ message: "Reply added successfully" });
  }
});

const deleteReplyToComment = asyncHandler(async (req, res) => {
  const { postId, commentId, replyId } = req.params;
  const post = await Post.findById(postId);
  const comment = post.comments.find((c) => c._id.toString() === commentId);
  const reply = comment.replies.find((r) => r._id.toString() === replyId);
  if (!post) {
    res.status(400);
    throw new Error("No such post exists");
  }
  if (!comment) {
    res.status(400);
    throw new Error("No such comment exists");
  }
  if (!replyId) {
    res.status(400);
    throw new Error("No such comment exists");
  }
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    res.status(404);
    throw new Error("No such post exists");
  }
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    res.status(404);
    throw new Error("No such comment exists");
  }
  if (!mongoose.Types.ObjectId.isValid(replyId)) {
    res.status(404);
    throw new Error("No such reply exists");
  }

  if (
    post &&
    comment &&
    reply &&
    reply.user.toString() === req.user._id.toString()
  ) {
    comment.replies = comment.replies.filter(
      (r) => r._id.toString() !== replyId
    );
    await post.save();
    return res.status(200).json({ message: "reply deleted successfully" });
  } else {
    res.status(400);
    throw new Error("Your are not authorized to delete this reply");
  }
});

export {
  createPost,
  getAllPosts,
  getSinglePost,
  deletePost,
  updatePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  replyToComment,
  deleteReplyToComment,
};
