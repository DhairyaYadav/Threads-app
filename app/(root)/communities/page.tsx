import CommunityCard from "@/component/cards/CommunityCard";
import UserCard from "@/component/cards/UserCard";
import { fetchCommunities } from "@/lib/actions/community.action";
import { fetchUser, fetchUsers } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const page = async () => {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  //Fetch all communities
  const  result = await fetchCommunities({
    searchString: '',
    pageNumber: 1,
    pageSize: 25
  });
  return (
    <section>
      <h1 className="head-text mb-10">Search</h1>

      <div className="mt-14 flex flex-col gap-9">
        {result.communities.length === 0 ?
        <p className="no-result">No users</p> 
        :
        <>
        {result.communities.map((person) => (
             <CommunityCard
             key={person.id}
             id={person.id}
             name={person.name}
             username={person.username}
             imgUrl={person.image}
             bio={person.bio}
             members={person.members}
             /> 
         ))}
        </>   
    }
      </div>
    </section>
  );
};

export default page;
