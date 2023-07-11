import express from "express";
import {
  createPost,
  getAllPosts,
  deletePost,
  updatePost,
  getSinglePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  replyToComment,
  deleteReplyToComment,
} from "../controllers/postController.js";
const router = express.Router();

router.post("/", createPost);
router.get("/", getAllPosts);
router.delete("/:postId", deletePost);
router.put("/:postId", updatePost);
router.get("/:postId", getSinglePost);
router.post("/:postId/like", likePost);
router.post("/:postId/unlike", unlikePost);
router.post("/:postId/comments", addComment);
router.delete("/:postId/comments/:commentId", deleteComment);
router.post("/:postId/comments/:commentId/reply", replyToComment);
router.delete(
  "/:postId/comments/:commentId/reply/:replyId",
  deleteReplyToComment
);

export default router;
