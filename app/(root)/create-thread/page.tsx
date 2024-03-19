import PostThread from "@/component/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"


const page = async () => {
    const user = await currentUser();

    if(!user) return null;

    const userInfo = await fetchUser(user.id);
    if(!userInfo?.onboarded) redirect('/onboarding');
  return (
    <div>
      <h1 className="head-text">Create   a   Thread</h1>

      <PostThread userId={userInfo._id} />
    </div>
  )
}

export default page
