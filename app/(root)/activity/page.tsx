import UserCard from "@/component/cards/UserCard";
import ParentDisplay from "@/component/shared/ParentDisplay";
import ProfileHeader from "@/component/shared/ProfileHeader";
import ThreadsTab from "@/component/shared/ThreadsTab";
import { profileTabs } from "@/constants";
import { fetchThreadById } from "@/lib/actions/thread.action";
import { fetchUser, fetchUsers, getActivity } from "@/lib/actions/user.action";
import Thread from "@/lib/models/thread.model";
import { currentUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const page = async () => {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(user.id); //user likely holds basic authentication-related data.
  //userInfo probably provides more detailed information about the user (e.g., profile data, preferences, etc.).

  if (!userInfo?.onboarded) redirect("/onboarding");

  //getActivity
  const activity = await getActivity(userInfo._id);
  return (
    <section>
      <h1 className="head-text mb-10">Activity</h1>

      <section className="mt-10 flex flex-col gap-5">
        {activity.length > 0 ? (
          <>
            {activity.map((activity) => (
              <Link key={activity._id} href={`/thread/${activity.parentId}`}>
                <article className="activity-card flex justify-between">
                  <div className="activity-card">
                    <Image
                      src={activity.author.image}
                      alt="profile picture"
                      width={20}
                      height={20}
                      className="rounded-full object-cover"
                    />
                    <div className="!text-small-regular text-light-1">
                      <Link href={`/profile/${(activity?.author?.id)}`}>
                        <span className="mr-1 text-primary-500 hover:underline">
                          {activity.author.name}
                        </span>{" "}
                      </Link>
                      replied to your thread
                    </div>
                  </div>
                  <div>
                    <ParentDisplay id={activity.parentId} className="ml-30" />
                  </div>
                </article>
              </Link>
            ))}
          </>
        ) : (
          <h3 className="!text-base-regular text-light-3">No activity yet</h3>
        )}
      </section>
    </section>
  );
};

export default page;
