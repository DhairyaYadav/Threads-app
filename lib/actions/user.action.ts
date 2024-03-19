"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import { getJsPageSizeInKb } from "next/dist/build/utils";
import { FilterQuery, SortOrder } from "mongoose";

interface params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

interface fetchUsers {
  userId: string,
  searchString?: string,
  pageNumber?: number,
  pageSize?: number,
  sortBy?: SortOrder
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: params): Promise<void> {
  connectToDB();

  try {
    await User.findOneAndUpdate(
      {
        id: userId,
      },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        path,
        onboarded:true
      },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUser(userId:string) {
    try {
        connectToDB();
        
        return await User
        .findOne({id:userId})
        // .populate({
        //     path: 'communities',
        //     model: Community
        // });
    } catch (error: any) {
        throw new Error (`Failed to fetch user: ${error.message}`)
    }
}

export async function fetchUserPosts(userId:string) {
  try {
  connectToDB();

  //Find all threads authored by user with the given userId
  const threads  = await User.findOne({id: userId})
  .populate({
    path: 'threads',
    model: Thread,
    populate: {
      path: 'children',
      model: Thread,
      populate: {
        path: 'author',
        model: User,
        select: 'name image id'
      }
    }
  })    

  return threads;
  } catch (error: any) {
    throw new Error(`Error while fetching user posts: ${error.message}`)
  }
}

export async function fetchUsers({userId,pageNumber=1,pageSize=20,searchString='',sortBy='desc'}:fetchUsers) {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, 'i');// making search case insensitive

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId } //filter out our current user
    }
    if(searchString.trim() !== ''){
      query.$or = [
        { username: { $regex: regex }}, // Regular expressions (regex) are powerful tools for pattern matching and text manipulation. They allow you to define search patterns in strings.
        { name: { $regex: regex }},
      ]
    }

    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
    .sort(sortOptions)
    .skip(skipAmount)
    .limit(pageSize)

    const totalNumbersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();
    const isNext = totalNumbersCount > skipAmount + users.length;

    return{ users, isNext };
  } catch (error: any) {
    throw new Error(`Could not fetch users: ${error.message}`)
  }
}

export async function getActivity(userId:string) {
  try {
    connectToDB()

    //find all threads created by the user
    const userThreads = await Thread.find({author: userId});

    //collect all the child threads ids from 'children' field 
    const childThreadIds = userThreads.reduce((acc,userThread) => {
      return acc.concat(userThread.children)
    },[])

    const replies = await Thread.find({
      id: { $in: childThreadIds },
      author: { $ne: userId }
    }).populate({
      path: 'author',
      model: User,
      select: 'name image id'
    })

    return replies;

  } catch (error: any) {
    throw new Error(`Cannot get activities: ${error.message}`)
  }
}