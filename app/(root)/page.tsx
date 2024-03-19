import ThreadCard from "@/component/cards/ThreadCard";
import { fetchPost } from "@/lib/actions/thread.action";
import User from "@/lib/models/user.model";
import { UserButton, currentUser } from "@clerk/nextjs";

export default async function Home() {
  const user = await currentUser();
  const result = await fetchPost(1, 30);

  console.log(result);

  return (
    <>
      <h1 className="head-text text-left">Home</h1>

      <section className="mt-9 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p className="no-result">No Threads found</p>
        ) : (
          <div>
            {result.posts.map((post) => (
              <ThreadCard
                key={post._id}
                id={post._id}
                currentUserId={user?.id || ""}
                parentId={post.parentId}
                content={post.text}
                author={post.author}
                community={post.community}
                createdAt={post.createdAt}
                comments={post.children}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
