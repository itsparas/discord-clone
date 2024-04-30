import { redirectToSignIn } from "@clerk/nextjs";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import { getOrCreateConversation } from "@/lib/conversation";
import { ChatHeader } from "@/components/chat/chat-header";

interface MemberIdPageProps {
  params: {
    serverlId: string;
    memberId: string;
  };
}

const MemberIdPage = async ({ params }: MemberIdPageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const currentMember = await db.member.findFirst({
    where: {
      serverId: params?.serverlId,
      profileId: profile?.id,
    },
    include: {
      profile: true,
    },
  });

  if (!currentMember) {
    return redirect("/");
  }

  const conversation = await getOrCreateConversation(
    currentMember?.id,
    params?.memberId
  );

  if (!conversation) {
    return redirect(`servers/${params?.serverlId}`);
  }

  const { memberOne, memberTwo } = conversation;

  const otherMember =
    memberOne?.profileId === profile?.id ? memberTwo : memberOne;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        imageUrl={otherMember?.profile?.imageUrl}
        name={otherMember?.profile?.name}
        type="conversation"
        serverId={params?.serverlId}
      />
    </div>
  );
};

export default MemberIdPage;
