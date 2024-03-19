"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ThreadValidation } from "@/lib/validations/thread";
import * as z from "zod";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
// import { updateUser } from "@/lib/actions/user.action";
import { usePathname, useRouter } from "next/navigation";
import { createThread } from "@/lib/actions/thread.action";
import { useOrganization } from "@clerk/nextjs";


interface Props {
  user: {
    id: string;
    objectID: string;
    username: string;
    name: string;
    bio: string;
    image: string;
  };
  btnTitle: string;
}

const PostThread = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const {organization} = useOrganization();

  const form = useForm({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread: "",
      accountId: userId,
    },
  });

  const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
        await createThread({
            text: values.thread,
            author: userId,
            communityId: organization ? organization.id : null,
            path: pathname
        });
    

    router.push('/');
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col justify-start gap-10"
        >
          <FormField
            control={form.control}
            name="thread"
            render={({ field }) => (
              <FormItem className="flex mt-5 gap-4 flex-col">
                <FormLabel className="text-base-semibold text-light-2 ">
                  Content:
                </FormLabel>
                <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                  <Textarea rows={15} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="bg-primary-500">
            Post Thread
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default PostThread;
