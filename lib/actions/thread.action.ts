"use server";
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import page from "@/app/(root)/create-thread/page";
import Community from "../models/community.model";

interface params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: params) {
  try {
    connectToDB();

    const communityIdObject = await Community.findOne(
        { id: communityId },
        { _id: 1 }
      );

    const createdThread = await Thread.create({
      text,
      author,
      community: communityIdObject,
    });

    //Update users model
    await User.findByIdAndUpdate(author, {
      $push: {
        threads: createdThread._id,
      },
    });

    if (communityIdObject) {
        // Update Community model
        await Community.findByIdAndUpdate(communityIdObject, {
          $push: { threads: createdThread._id },
        });
      }

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Could not create thread: ${error.message}`);
  }
}

export async function fetchPost(pageNumber = 1, pageSize = 20) {
  connectToDB();

  //calculate the number of post to skip
  const skipAmount = (pageNumber - 1) * pageSize;

  // Fetch the posts with no parents (Top-level threads...)
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "community",
      model: Community,
    })
    .populate({
      path: "children", // Populate the children field
      populate: {
        path: "author", // Populate the author field within children
        model: User,
        select: "_id name parentId image", // Select only _id and username fields of the author
      },
    });

  const totalPostCount = await Thread.countDocuments({
    parentId: {
      $in: [null, undefined],
    },
  });

  const posts = await postsQuery.exec();

  const isNext = totalPostCount > skipAmount + posts.length;

  return { posts, isNext };
}

export async function fetchThreadById(id: string) {
  connectToDB();

  try {
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
        },
      })
      .populate({
        path: "children",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "_id id name image",
        },
      })
      .exec();

    return thread;
  } catch (error: any) {
    throw new Error(`Could not fetch comment thread: ${error}`);
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    //adding a comment
    //find the original thread by its id
    const ogThread = await Thread.findById(threadId);

    if (!ogThread) throw new Error("Thread not found");

    //Create a new thread with the comment text
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    //save the new thread
    const savedCommentThread = await commentThread.save();

    //Update the original thread to include the new comment
    ogThread.children.push(savedCommentThread._id);

    //save the original thread
    await ogThread.save();

    revalidatePath(path); //so that it shows instant update
  } catch (error: any) {
    throw new Error(`Error adding comment to thread: ${error.message}`);
  }
}
